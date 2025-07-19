import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Temporary in-memory storage (replace with Supabase)
const squads = new Map();
const squadMembers = new Map(); // squadId -> Set of userIds

// Create a new squad
router.post('/create', authenticateToken, (req, res) => {
  try {
    const { name, description, isPrivate = false } = req.body;
    const userId = req.user.userId;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Squad name is required' });
    }

    const squadId = generateSquadId();
    const squad = {
      id: squadId,
      name: name.trim(),
      description: description || '',
      isPrivate,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${squadId}`,
      settings: {
        allowGuestJoin: !isPrivate,
        autoPlay: true,
        syncTolerance: 500, // milliseconds
        maxMembers: 50
      },
      stats: {
        totalSessions: 0,
        totalWatchTime: 0,
        memberCount: 1
      }
    };

    squads.set(squadId, squad);
    
    // Add creator as first member
    if (!squadMembers.has(squadId)) {
      squadMembers.set(squadId, new Set());
    }
    squadMembers.get(squadId).add(userId);

    res.status(201).json({
      message: 'Squad created successfully',
      squad
    });

  } catch (error) {
    console.error('Create squad error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's squads
router.get('/my-squads', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const userSquads = [];

    for (const [squadId, squad] of squads.entries()) {
      const members = squadMembers.get(squadId);
      if (members && members.has(userId)) {
        userSquads.push({
          ...squad,
          memberCount: members.size,
          isOwner: squad.createdBy === userId
        });
      }
    }

    // Sort by creation date (newest first)
    userSquads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ squads: userSquads });

  } catch (error) {
    console.error('Get squads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get squad details
router.get('/:squadId', authenticateToken, (req, res) => {
  try {
    const { squadId } = req.params;
    const userId = req.user.userId;

    const squad = squads.get(squadId);
    if (!squad) {
      return res.status(404).json({ error: 'Squad not found' });
    }

    const members = squadMembers.get(squadId);
    if (!members || !members.has(userId)) {
      if (squad.isPrivate) {
        return res.status(403).json({ error: 'Access denied to private squad' });
      }
    }

    res.json({
      squad: {
        ...squad,
        memberCount: members ? members.size : 0,
        isOwner: squad.createdBy === userId,
        isMember: members ? members.has(userId) : false
      }
    });

  } catch (error) {
    console.error('Get squad error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join a squad
router.post('/:squadId/join', authenticateToken, (req, res) => {
  try {
    const { squadId } = req.params;
    const userId = req.user.userId;

    const squad = squads.get(squadId);
    if (!squad) {
      return res.status(404).json({ error: 'Squad not found' });
    }

    if (!squadMembers.has(squadId)) {
      squadMembers.set(squadId, new Set());
    }

    const members = squadMembers.get(squadId);
    
    // Check if already a member
    if (members.has(userId)) {
      return res.status(400).json({ error: 'Already a member of this squad' });
    }

    // Check if squad is full
    if (members.size >= squad.settings.maxMembers) {
      return res.status(400).json({ error: 'Squad is full' });
    }

    // Check if private and not invited (simplified - in real app, check invitations)
    if (squad.isPrivate && squad.createdBy !== userId) {
      return res.status(403).json({ error: 'Cannot join private squad without invitation' });
    }

    // Add user to squad
    members.add(userId);
    squad.stats.memberCount = members.size;

    res.json({
      message: 'Successfully joined squad',
      squad: {
        ...squad,
        memberCount: members.size,
        isOwner: squad.createdBy === userId,
        isMember: true
      }
    });

  } catch (error) {
    console.error('Join squad error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave a squad
router.post('/:squadId/leave', authenticateToken, (req, res) => {
  try {
    const { squadId } = req.params;
    const userId = req.user.userId;

    const squad = squads.get(squadId);
    if (!squad) {
      return res.status(404).json({ error: 'Squad not found' });
    }

    const members = squadMembers.get(squadId);
    if (!members || !members.has(userId)) {
      return res.status(400).json({ error: 'Not a member of this squad' });
    }

    // Cannot leave if you're the owner and there are other members
    if (squad.createdBy === userId && members.size > 1) {
      return res.status(400).json({ 
        error: 'Transfer ownership before leaving squad with members' 
      });
    }

    // Remove user from squad
    members.delete(userId);
    squad.stats.memberCount = members.size;

    // Delete squad if no members left
    if (members.size === 0) {
      squads.delete(squadId);
      squadMembers.delete(squadId);
    }

    res.json({ message: 'Successfully left squad' });

  } catch (error) {
    console.error('Leave squad error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update squad settings
router.put('/:squadId/settings', authenticateToken, (req, res) => {
  try {
    const { squadId } = req.params;
    const userId = req.user.userId;
    const { name, description, isPrivate, settings } = req.body;

    const squad = squads.get(squadId);
    if (!squad) {
      return res.status(404).json({ error: 'Squad not found' });
    }

    // Only owner can update settings
    if (squad.createdBy !== userId) {
      return res.status(403).json({ error: 'Only squad owner can update settings' });
    }

    // Update squad properties
    if (name) squad.name = name.trim();
    if (description !== undefined) squad.description = description;
    if (isPrivate !== undefined) squad.isPrivate = isPrivate;
    if (settings) {
      squad.settings = { ...squad.settings, ...settings };
    }

    res.json({
      message: 'Squad updated successfully',
      squad
    });

  } catch (error) {
    console.error('Update squad error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate invite link
router.post('/:squadId/invite', authenticateToken, (req, res) => {
  try {
    const { squadId } = req.params;
    const userId = req.user.userId;

    const squad = squads.get(squadId);
    if (!squad) {
      return res.status(404).json({ error: 'Squad not found' });
    }

    const members = squadMembers.get(squadId);
    if (!members || !members.has(userId)) {
      return res.status(403).json({ error: 'Must be a member to generate invite' });
    }

    // Generate invite code (in real app, store this in database with expiration)
    const inviteCode = generateInviteCode();
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${squadId}?invite=${inviteCode}`;

    res.json({
      inviteLink,
      inviteCode,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });

  } catch (error) {
    console.error('Generate invite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function generateSquadId() {
  return 'squad_' + Math.random().toString(36).substr(2, 9);
}

function generateInviteCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

export default router;
