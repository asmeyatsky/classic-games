/**
 * Achievements Component - Player Achievement Display
 *
 * Handles:
 * - Achievement badge display grid
 * - Locked and unlocked states
 * - Achievement details modal
 * - Filter by category
 * - Progress tracking
 * - Tooltip information
 *
 * Architectural Intent:
 * - Beautiful achievement showcase with interactive badges
 * - Responsive grid layout
 * - Integration with UserManager achievement data
 * - Motivational display for player progression
 */

import React, { useState } from 'react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gameplay' | 'social' | 'milestone' | 'challenge';
  unlockedAt?: number;
}

export interface AchievementsProps {
  achievements: Achievement[];
  allAchievements?: Achievement[];
  className?: string;
}

export const Achievements: React.FC<AchievementsProps> = ({
  achievements,
  allAchievements = [],
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | Achievement['category']>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Get list of all achievements including locked ones
  const displayAchievements = allAchievements.length > 0 ? allAchievements : achievements;

  // Create a set of unlocked achievement IDs
  const unlockedIds = new Set(achievements.map((a) => a.id));

  // Filter achievements by selected category
  const filteredAchievements =
    selectedCategory === 'all'
      ? displayAchievements
      : displayAchievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = achievements.length;
  const totalCount = allAchievements.length || achievements.length;
  const completionPercent = Math.round((unlockedCount / totalCount) * 100);

  const getCategoryLabel = (category: Achievement['category']) => {
    const labels: Record<Achievement['category'], string> = {
      gameplay: 'Gameplay',
      social: 'Social',
      milestone: 'Milestone',
      challenge: 'Challenge',
    };
    return labels[category];
  };

  const getCategoryColor = (category: Achievement['category']) => {
    const colors: Record<Achievement['category'], { bg: string; border: string; text: string }> = {
      gameplay: {
        bg: 'rgba(59, 130, 246, 0.1)',
        border: 'rgba(59, 130, 246, 0.3)',
        text: '#60a5fa',
      },
      social: { bg: 'rgba(236, 72, 153, 0.1)', border: 'rgba(236, 72, 153, 0.3)', text: '#ec4899' },
      milestone: {
        bg: 'rgba(168, 85, 247, 0.1)',
        border: 'rgba(168, 85, 247, 0.3)',
        text: '#c084fc',
      },
      challenge: {
        bg: 'rgba(251, 146, 60, 0.1)',
        border: 'rgba(251, 146, 60, 0.3)',
        text: '#fb923c',
      },
    };
    return colors[category];
  };

  return (
    <div className={`achievements ${className}`}>
      {/* Header */}
      <div className="achievements-header">
        <div className="header-content">
          <h2 className="title">Achievements</h2>
          <div className="progress-info">
            <p className="progress-text">
              {unlockedCount} of {totalCount} unlocked
            </p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
            </div>
            <p className="progress-percent">{completionPercent}% Complete</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {(['all', 'gameplay', 'social', 'milestone', 'challenge'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`category-button ${selectedCategory === cat ? 'active' : ''}`}
            aria-label={`Filter by ${cat}`}
          >
            {cat === 'all' ? 'All' : getCategoryLabel(cat as Achievement['category'])}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="achievements-grid">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const unlockedDate = achievements.find((a) => a.id === achievement.id)?.unlockedAt;

          return (
            <button
              key={achievement.id}
              onClick={() => setSelectedAchievement(achievement)}
              className={`achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}`}
              aria-label={`${achievement.name}: ${achievement.description}`}
              title={
                isUnlocked
                  ? `Unlocked ${new Date(unlockedDate || 0).toLocaleDateString()}`
                  : 'Locked'
              }
            >
              <div className="badge-icon">{achievement.icon}</div>
              <div className="badge-info">
                <p className="badge-name">{achievement.name}</p>
                {!isUnlocked && <p className="badge-locked">Locked</p>}
              </div>
              {isUnlocked && <div className="unlock-badge">✓</div>}
            </button>
          );
        })}
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="achievement-modal-overlay" onClick={() => setSelectedAchievement(null)}>
          <div className="achievement-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setSelectedAchievement(null)}
              aria-label="Close"
            >
              ✕
            </button>

            <div className="modal-content">
              <div className="modal-icon">{selectedAchievement.icon}</div>
              <h3 className="modal-name">{selectedAchievement.name}</h3>

              <div className="modal-category">{getCategoryLabel(selectedAchievement.category)}</div>

              <p className="modal-description">{selectedAchievement.description}</p>

              {unlockedIds.has(selectedAchievement.id) && selectedAchievement.unlockedAt && (
                <div className="unlock-info">
                  <p className="unlock-label">Unlocked</p>
                  <p className="unlock-date">
                    {new Date(selectedAchievement.unlockedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {!unlockedIds.has(selectedAchievement.id) && (
                <div className="locked-info">
                  <p className="locked-label">Keep playing to unlock this achievement!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
