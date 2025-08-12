import { SummaryMetrics } from "@/components/dashboard/summary-metrics";
import { TopComplaints } from "@/components/dashboard/top-complaints";
import { TopAlternatives } from "@/components/dashboard/top-alternatives";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import { SentimentChart } from "@/components/common/sentiment-chart";
import { useAppStore } from "@/lib/store";
import { useMemo } from "react";
import { MentionPoint } from "@/types";

export default function Dashboard() {
  const { competitors } = useAppStore();
  
  // Combine mentions over time data from all competitors
  const combinedMentionsData = useMemo(() => {
    const dateMap = new Map<string, MentionPoint>();
    
    competitors.forEach(competitor => {
      competitor.mentionsOverTime.forEach(point => {
        if (dateMap.has(point.date)) {
          const existing = dateMap.get(point.date)!;
          dateMap.set(point.date, {
            date: point.date,
            value: existing.value + point.value,
            sentiment: (existing.sentiment + point.sentiment) / 2 // Average sentiment
          });
        } else {
          dateMap.set(point.date, { ...point });
        }
      });
    });
    
    // Convert map to sorted array
    return Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [competitors]);

  return (
    <div className="space-y-6">
      <SummaryMetrics competitors={competitors} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SentimentChart 
            data={combinedMentionsData} 
            title="Competitor Mentions" 
            description="Mentions and sentiment across all platforms"
          />
        </div>
        <div>
          <TopComplaints />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div>
          <TopAlternatives />
        </div>
        <div className="lg:col-span-2">
          <RecentLeads />
        </div>
      </div>
    </div>
  );
}