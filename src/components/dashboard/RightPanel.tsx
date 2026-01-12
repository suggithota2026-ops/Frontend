import { Calendar, Clock, Video, Users, FileText, TrendingUp, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const activityData: any[] = [];

const scheduleItems: any[] = [];

export function RightPanel() {
  return (
    <aside className="w-full xl:w-80 shrink-0 bg-card border-l border-border px-4 md:px-5 pb-4 md:pb-5 hidden xl:flex xl:flex-col overflow-x-hidden sticky top-14 xl:top-16 h-[calc(100vh-3.5rem)] xl:h-[calc(100vh-4rem)] max-h-screen">
      <div className="flex-1 flex flex-col overflow-hidden pr-1">
        {/* Scrollable Content with Accordions */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 hide-scrollbar pt-3 md:pt-4">
          <Accordion type="multiple" defaultValue={["activity", "schedule", "stats"]} className="space-y-3">
            {/* Activity Overview */}
            <AccordionItem value="activity" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-base font-semibold text-foreground">Activity Overview</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="dashboard-card p-4">
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {activityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-3 flex-wrap">
                    {activityData.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5 text-xs">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground whitespace-nowrap">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Upcoming Schedule */}
            <AccordionItem value="schedule" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-base font-semibold text-foreground">Upcoming Schedule</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-2">
                  {scheduleItems.map((item) => (
                    <div
                      key={item.title}
                      className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${item.color} shrink-0`}>
                        <item.icon className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3 shrink-0" />
                          {item.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Quick Stats */}
            <AccordionItem value="stats" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-3">
                <h3 className="text-base font-semibold text-foreground">Quick Stats</h3>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-primary mb-1">0%</p>
                    <p className="text-xs text-muted-foreground">Task Done</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-success mb-1">0</p>
                    <p className="text-xs text-muted-foreground">Projects</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </aside>
  );
}
