import { useParams } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import { useMemo } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { SentimentChart } from "@/components/common/sentiment-chart";
import { ClusterTag } from "@/components/common/cluster-tag";
import { CommentTable } from "@/components/common/comment-table";
import { Card } from "@/components/common/card";
import { 
  MessageSquare, 
  TrendingDown, 
  Repeat 
} from "lucide-react";
import { MetricsCard } from "@/components/common/metrics-card";
import { formatNumber } from "@/lib/utils";

export default function CompetitorDetails() {
  const { id } = useParams<{ id: string }>();
  const { competitors, comments, painPoints } = useAppStore();
  
  // Find the selected competitor
  const competitor = useMemo(() => {
    return competitors.find((comp) => comp.id === id);
  }, [competitors, id]);
  
  // Filter comments for this competitor
  const competitorComments = useMemo(() => {
    return comments.filter((comment) => comment.competitorId === id);
  }, [comments, id]);
  
  // Filter pain points for this competitor
  const competitorPainPoints = useMemo(() => {
    return painPoints.filter((painPoint) => painPoint.competitorId === id);
  }, [painPoints, id]);
  
  // Calculate negative mentions
  const negativeMentions = useMemo(() => {
    if (!competitor) return 0;
    return Math.round(competitor.totalMentions * competitor.negativeSentiment);
  }, [competitor]);

  if (!competitor) {
    return <div>Competitor not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{competitor.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricsCard
          title="Total Mentions"
          value={formatNumber(competitor.totalMentions)}
          icon={MessageSquare}
          change={8}
          trend="positive"
          description="last month"
        />
        <MetricsCard
          title="Negative Mentions"
          value={formatNumber(negativeMentions)}
          icon={TrendingDown}
          change={-3}
          trend="negative"
          description="last month"
        />
        <MetricsCard
          title="Alternatives Mentioned"
          value={competitor.alternativesMentioned.length}
          icon={Repeat}
          change={12}
          trend="positive"
          description="last month"
        />
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="pain-points">Pain Points</TabsTrigger>
          <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <SentimentChart
            data={competitor.mentionsOverTime}
            title="Mentions Over Time"
            description="Mentions and sentiment trends"
          />
          
          <Card
            title="Trending Complaints"
            description="Most common issues mentioned"
            contentClassName="flex flex-wrap gap-2"
          >
            {competitor.trendingComplaints.map((complaint, index) => (
              <ClusterTag
                key={index}
                label={complaint}
                variant={
                  index === 0
                    ? "destructive"
                    : index === 1
                    ? "warning"
                    : index % 2 === 0
                    ? "default"
                    : "secondary"
                }
              />
            ))}
          </Card>
        </TabsContent>
        
        <TabsContent value="comments" className="mt-6">
          <CommentTable comments={competitorComments} />
        </TabsContent>
        
        <TabsContent value="pain-points" className="mt-6">
          <Card title="Clustered Pain Points" description="Automatically extracted issues">
            <div className="space-y-6">
              {competitorPainPoints.map((painPoint) => (
                <div key={painPoint.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <ClusterTag
                      label={painPoint.label}
                      count={painPoint.count}
                      size="lg"
                    />
                    <span className="text-sm text-muted-foreground">
                      {painPoint.count} mentions
                    </span>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <ul className="space-y-2 ml-4">
                      {painPoint.examples.map((example, idx) => (
                        <li key={idx} className="list-disc text-sm text-muted-foreground">
                          "{example}"
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="alternatives" className="mt-6">
          <Card title="Alternatives Mentioned" description="Products users are switching to">
            <div className="space-y-4">
              {competitor.alternativesMentioned.map((alternative, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <span className="font-medium">{alternative.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {alternative.count} mentions
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}