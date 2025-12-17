import React from 'react';
import { useCampaigns } from '../hooks/useCampaigns';
import { CampaignCard } from '../components/CampaignCard';
import { Loader } from 'lucide-react';

export default function CampaignsPage() {
  const { data: campaigns, isLoading, error } = useCampaigns({ status: 'ACTIVE' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Failed to load campaigns</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Campaigns</h1>
        <p className="text-slate-600">Discover amazing projects and support creators</p>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-600">No active campaigns available</p>
        </div>
      )}
    </div>
  );
}
