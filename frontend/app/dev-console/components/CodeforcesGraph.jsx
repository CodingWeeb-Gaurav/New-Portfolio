import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const CodeforcesGraph = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center">
        <p className="text-gray-400 text-sm">No rating history available</p>
      </div>
    );
  }

  // Process data to include timestamp
  const processedData = data.map((point) => ({
    ...point,
    timestamp: new Date(point.date).getTime(),
  })).sort((a, b) => a.timestamp - b.timestamp);

  // Function to generate 6-month interval ticks
  const getSixMonthTicks = (data) => {
    if (data.length === 0) return [];
    
    const minDate = new Date(data[0].timestamp);
    const maxDate = new Date(data[data.length - 1].timestamp);
    
    // Round min date to start of month
    minDate.setDate(1);
    // Round max date to end of month
    maxDate.setMonth(maxDate.getMonth() + 1);
    maxDate.setDate(0);
    
    const ticks = [];
    let currentDate = new Date(minDate);
    
    // Find first tick (next 6-month boundary)
    const startMonth = minDate.getMonth();
    const firstTickMonth = startMonth + (6 - (startMonth % 6));
    currentDate.setMonth(firstTickMonth);
    if (currentDate > minDate) {
      ticks.push(currentDate.getTime());
    }
    
    // Add subsequent 6-month ticks
    while (currentDate <= maxDate) {
      currentDate.setMonth(currentDate.getMonth() + 6);
      if (currentDate <= maxDate) {
        ticks.push(currentDate.getTime());
      }
    }
    
    return ticks;
  };

  const sixMonthTicks = getSixMonthTicks(processedData);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processedData}
          margin={{ top: 20, right: 20, bottom: 50, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2f3e4e" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            ticks={sixMonthTicks}
            tickFormatter={(timestamp) => {
              return new Date(timestamp).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              });
            }}
            scale="time"
            angle={-30}
            textAnchor="end"
            height={50}
            tick={{ fill: '#ccc', fontSize: 10 }}
          />
          <YAxis
            domain={['dataMin - 100', 'dataMax + 100']}
            tick={{ fill: '#ccc', fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [`Rating: ${value}`]}
            labelFormatter={(_, payload) => {
              if (!payload || !payload.length) return '';
              const item = payload[0].payload;
              return `${item.contestName} (${new Date(item.date).toLocaleDateString()})`;
            }}
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              borderRadius: 8,
            }}
            labelStyle={{ color: '#93c5fd' }}
          />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#f472b6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#f472b6' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CodeforcesGraph;