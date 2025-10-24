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
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | Achievement['category']>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Get list of all achievements including locked ones
  const displayAchievements = allAchievements.length > 0
    ? allAchievements
    : achievements;

  // Create a set of unlocked achievement IDs
  const unlockedIds = new Set(achievements.map(a => a.id));

  // Filter achievements by selected category
  const filteredAchievements = selectedCategory === 'all'
    ? displayAchievements
    : displayAchievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.length;
  const totalCount = allAchievements.length || achievements.length;
  const completionPercent = Math.round((unlockedCount / totalCount) * 100);

  const getCategoryLabel = (category: Achievement['category']) => {
    const labels: Record<Achievement['category'], string> = {
      gameplay: 'Gameplay',
      social: 'Social',
      milestone: 'Milestone',
      challenge: 'Challenge'
    };
    return labels[category];
  };

  const getCategoryColor = (category: Achievement['category']) => {
    const colors: Record<Achievement['category'], { bg: string; border: string; text: string }> = {
      gameplay: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#60a5fa' },
      social: { bg: 'rgba(236, 72, 153, 0.1)', border: 'rgba(236, 72, 153, 0.3)', text: '#ec4899' },
      milestone: { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', text: '#c084fc' },
      challenge: { bg: 'rgba(251, 146, 60, 0.1)', border: 'rgba(251, 146, 60, 0.3)', text: '#fb923c' }
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
            <p className="progress-text">{unlockedCount} of {totalCount} unlocked</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="progress-percent">{completionPercent}% Complete</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {(['all', 'gameplay', 'social', 'milestone', 'challenge'] as const).map(cat => (
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
          const unlockedDate = achievements.find(a => a.id === achievement.id)?.unlockedAt;

          return (
            <button
              key={achievement.id}
              onClick={() => setSelectedAchievement(achievement)}
              className={`achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}`}
              aria-label={`${achievement.name}: ${achievement.description}`}
              title={isUnlocked ? `Unlocked ${new Date(unlockedDate || 0).toLocaleDateString()}` : 'Locked'}
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
        <div
          className="achievement-modal-overlay"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="achievement-modal"
            onClick={e => e.stopPropagation()}
          >
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

              <div className="modal-category">
                {getCategoryLabel(selectedAchievement.category)}
              </div>

              <p className="modal-description">{selectedAchievement.description}</p>

              {unlockedIds.has(selectedAchievement.id) && selectedAchievement.unlockedAt && (
                <div className="unlock-info">
                  <p className="unlock-label">Unlocked</p>
                  <p className="unlock-date">
                    {new Date(selectedAchievement.unlockedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
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

      <style jsx>{`
        .achievements {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.6), rgba(30, 41, 59, 0.6));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          padding: 32px;
        }

        .achievements-header {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .title {
          margin: 0 0 16px 0;
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
        }

        .progress-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-text {
          margin: 0;
          font-size: 13px;
          color: #94a3b8;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: rgba(148, 163, 184, 0.2);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-percent {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          color: #60a5fa;
        }

        .category-filter {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .category-button {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(148, 163, 184, 0.05);
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-button:hover {
          border-color: #60a5fa;
          background: rgba(96, 165, 250, 0.1);
          color: #60a5fa;
        }

        .category-button.active {
          border-color: #60a5fa;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(96, 165, 250, 0.2));
          color: #60a5fa;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 16px;
        }

        .achievement-badge {
          position: relative;
          padding: 16px;
          border-radius: 12px;
          border: 2px solid rgba(148, 163, 184, 0.2);
          background: rgba(148, 163, 184, 0.05);
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }

        .achievement-badge.unlocked {
          border-color: #60a5fa;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(96, 165, 250, 0.1));
          color: #60a5fa;
        }

        .achievement-badge.unlocked:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
        }

        .achievement-badge.locked {
          opacity: 0.5;
        }

        .achievement-badge.locked:hover {
          opacity: 0.7;
          transform: none;
        }

        .badge-icon {
          font-size: 32px;
          line-height: 1;
        }

        .badge-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .badge-name {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          color: inherit;
          line-height: 1.2;
        }

        .badge-locked {
          margin: 0;
          font-size: 10px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .unlock-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #34d399, #10b981);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 700;
        }

        .achievement-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .achievement-modal {
          position: relative;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 16px;
          padding: 40px 32px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .close-button {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(148, 163, 184, 0.05);
          color: #94a3b8;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-button:hover {
          border-color: #60a5fa;
          background: rgba(96, 165, 250, 0.1);
          color: #60a5fa;
        }

        .modal-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .modal-icon {
          font-size: 64px;
          line-height: 1;
        }

        .modal-name {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
        }

        .modal-category {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .modal-description {
          margin: 0;
          font-size: 14px;
          color: #cbd5e1;
          line-height: 1.6;
        }

        .unlock-info {
          padding: 16px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(74, 222, 128, 0.1));
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
        }

        .unlock-label {
          margin: 0 0 4px 0;
          font-size: 11px;
          font-weight: 600;
          color: #86efac;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .unlock-date {
          margin: 0;
          font-size: 14px;
          color: #86efac;
          font-weight: 600;
        }

        .locked-info {
          padding: 16px;
          background: linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(254, 215, 170, 0.1));
          border: 1px solid rgba(251, 146, 60, 0.3);
          border-radius: 8px;
        }

        .locked-label {
          margin: 0;
          font-size: 13px;
          color: #fed7aa;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .achievements {
            padding: 20px;
          }

          .achievements-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 12px;
          }

          .achievement-modal {
            width: 95%;
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Achievements;
