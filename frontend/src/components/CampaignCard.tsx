import React from 'react';
import { Campaign } from '../types/index';
import { Link } from 'react-router-dom';
import { TrendingUp, Users } from 'lucide-react';

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progressPercent = Math.min(campaign.progressPercentage, 100);

  return (
    <Link to={`/campaigns/${campaign.id}`}>
      <div className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-elevated transition group">
        {campaign.thumbnailUrl && (
          <img
            src={campaign.thumbnailUrl}
            alt={campaign.title}
            className="w-full h-48 object-cover group-hover:brightness-95 transition"
          />
        )}
        <div className="p-4">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded">
            {campaign.category}
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-2 line-clamp-2">
            {campaign.title}
          </h3>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-900">
                ${campaign.raisedAmount.toFixed(0)}
              </span>
              <span className="text-slate-600">
                ${campaign.goalAmount.toFixed(0)}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {campaign.totalDonors} donors
            </div>
            <div>{Math.round(progressPercent)}% funded</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
