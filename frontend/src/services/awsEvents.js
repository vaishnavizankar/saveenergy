import { generateClient } from 'aws-amplify/api';

const client = generateClient();

// Subscription to Live Carbon Metrics via AWS AppSync
export const subscribeToMetrics = (setMetrics) => {
  console.log("Establishing AppSync Subscription for SaveEnergy...");
  
  const subscription = client.graphql({
    query: `
      subscription OnNewMetric {
        onNewMetric {
          resource_id
          name
          type
          cpu
          carbon
          timestamp
        }
      }
    `
  }).subscribe({
    next: ({ data }) => {
      const metric = data.onNewMetric;
      console.log(`[AppSync Live] New Metric from ${metric.name}: ${metric.carbon} kg CO2e`);
      
      // Update local state for charts/tables
      setMetrics((prevMetrics) => {
        const index = prevMetrics.findIndex(m => m.resource_id === metric.resource_id);
        if (index > -1) {
          const updated = [...prevMetrics];
          updated[index] = metric;
          return updated;
        }
        return [...prevMetrics, metric];
      });
    },
    error: (err) => console.error("AppSync Error:", err)
  });

  return () => subscription.unsubscribe();
};
