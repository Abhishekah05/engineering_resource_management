const Assignment = require('../models/Assignment');

/**
 * Calculate available capacity for an engineer
 */
const getAvailableCapacity = async (engineerId, engineer = null) => {
  try {
    if (!engineer) {
      const User = require('../models/User');
      engineer = await User.findById(engineerId);
      if (!engineer) throw new Error('Engineer not found');
    }

    const now = new Date();
    const activeAssignments = await Assignment.find({
      engineerId: engineerId,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    const totalAllocated = activeAssignments.reduce((sum, assignment) => {
      return sum + assignment.allocationPercentage;
    }, 0);

    const availableCapacity = engineer.maxCapacity - totalAllocated;
    
    return {
      maxCapacity: engineer.maxCapacity,
      allocated: totalAllocated,
      available: Math.max(0, availableCapacity),
      utilizationPercentage: Math.round((totalAllocated / engineer.maxCapacity) * 100)
    };
  } catch (error) {
    console.error('Error calculating available capacity:', error);
    throw error;
  }
};

/**
 * Find engineers suitable for a project based on required skills
 */
const findSuitableEngineers = async (project) => {
  try {
    const User = require('../models/User');
    
    if (!project.requiredSkills || project.requiredSkills.length === 0) {
      return await User.find({ role: 'engineer', isActive: true });
    }

    const suitableEngineers = await User.find({
      role: 'engineer',
      isActive: true,
      skills: { $in: project.requiredSkills }
    });

    // Calculate match score for each engineer
    const engineersWithScore = suitableEngineers.map(engineer => {
      const matchingSkills = engineer.skills.filter(skill => 
        project.requiredSkills.includes(skill)
      );
      const matchScore = (matchingSkills.length / project.requiredSkills.length) * 100;
      
      return {
        ...engineer.toObject(),
        matchScore: Math.round(matchScore),
        matchingSkills
      };
    });

    // Sort by match score (highest first)
    return engineersWithScore.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Error finding suitable engineers:', error);
    throw error;
  }
};

/**
 * Check if an assignment would cause capacity overflow
 */
const validateAssignmentCapacity = async (engineerId, allocationPercentage, startDate, endDate, excludeAssignmentId = null) => {
  try {
    const User = require('../models/User');
    const engineer = await User.findById(engineerId);
    
    if (!engineer) {
      return { isValid: false, message: 'Engineer not found' };
    }

    // Find overlapping assignments
    const query = {
      engineerId: engineerId,
      status: 'active',
      $or: [
        {
          startDate: { $lte: startDate },
          endDate: { $gte: startDate }
        },
        {
          startDate: { $lte: endDate },
          endDate: { $gte: endDate }
        },
        {
          startDate: { $gte: startDate },
          endDate: { $lte: endDate }
        }
      ]
    };

    if (excludeAssignmentId) {
      query._id = { $ne: excludeAssignmentId };
    }

    const overlappingAssignments = await Assignment.find(query);
    
    const totalOverlapping = overlappingAssignments.reduce((sum, assignment) => {
      return sum + assignment.allocationPercentage;
    }, 0);

    const totalAfterNewAssignment = totalOverlapping + allocationPercentage;

    if (totalAfterNewAssignment > engineer.maxCapacity) {
      return {
        isValid: false,
        message: `Assignment would exceed capacity. Current overlapping: ${totalOverlapping}%, Requested: ${allocationPercentage}%, Max: ${engineer.maxCapacity}%`,
        currentOverlapping: totalOverlapping,
        maxCapacity: engineer.maxCapacity
      };
    }

    return {
      isValid: true,
      message: 'Assignment is within capacity limits',
      currentOverlapping: totalOverlapping,
      maxCapacity: engineer.maxCapacity
    };
  } catch (error) {
    console.error('Error validating assignment capacity:', error);
    throw error;
  }
};

/**
 * Get team utilization statistics
 */
const getTeamUtilization = async () => {
  try {
    const User = require('../models/User');
    const engineers = await User.find({ role: 'engineer', isActive: true });
    
    const utilizationStats = await Promise.all(
      engineers.map(async (engineer) => {
        const capacity = await getAvailableCapacity(engineer._id, engineer);
        return {
          engineerId: engineer._id,
          name: engineer.name,
          department: engineer.department,
          seniority: engineer.seniority,
          ...capacity
        };
      })
    );

    const totalEngineers = utilizationStats.length;
    const averageUtilization = totalEngineers > 0 
      ? utilizationStats.reduce((sum, stat) => sum + stat.utilizationPercentage, 0) / totalEngineers 
      : 0;
    
    const overutilized = utilizationStats.filter(stat => stat.utilizationPercentage > 90).length;
    const underutilized = utilizationStats.filter(stat => stat.utilizationPercentage < 50).length;
    const optimized = totalEngineers - overutilized - underutilized;

    return {
      totalEngineers,
      averageUtilization: Math.round(averageUtilization),
      overutilized,
      underutilized,
      optimized,
      engineers: utilizationStats
    };
  } catch (error) {
    console.error('Error calculating team utilization:', error);
    throw error;
  }
};

module.exports = {
  getAvailableCapacity,
  findSuitableEngineers,
  validateAssignmentCapacity,
  getTeamUtilization
};