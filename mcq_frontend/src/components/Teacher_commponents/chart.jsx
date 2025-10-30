

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
const API = import.meta.env.VITE_BACKEND_API_URL;

const GoogleStyleInsights = ({ quizId }) => {
  const [setsData, setSetsData] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          // `http://localhost:3001/api/leaderboard/getall/${quizId}`
          `${API}/api/leaderboard/getall/${quizId}`

        );

        let globalMaxScore = 0; 

        const processedSets = response.data.leaderboards.map(leaderboard => {
          const setScores = leaderboard.rankings.map(r => r.score);
          
          if (setScores.length === 0) return null; 

          const maxScore = Math.max(...setScores);
          globalMaxScore = Math.max(globalMaxScore, maxScore);

          const average = setScores.reduce((sum, score) => sum + score, 0) / setScores.length;
          const sortedScores = [...setScores].sort((a, b) => a - b);
          const median = sortedScores.length % 2 === 0 
            ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
            : sortedScores[Math.floor(sortedScores.length / 2)];

          const scoreFrequency = {};
          setScores.forEach(score => {
            scoreFrequency[score] = (scoreFrequency[score] || 0) + 1;
          });

          const histogramData = [];
          for (let i = 0; i <= maxScore; i++) {
            histogramData.push({
              score: i,
              count: scoreFrequency[i] || 0
            });
          }

          return {
            setNumber: leaderboard.setNumber,
            scores: setScores,
            average,
            median,
            minScore: Math.min(...setScores),
            maxScore,
            histogramData
          };
        }).filter(set => set !== null); 

        const allScores = processedSets.flatMap(set => set.scores);
        const overallAverage = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
        const sortedAllScores = [...allScores].sort((a, b) => a - b);
        const overallMedian = sortedAllScores.length % 2 === 0 
          ? (sortedAllScores[sortedAllScores.length / 2 - 1] + sortedAllScores[sortedAllScores.length / 2]) / 2
          : sortedAllScores[Math.floor(sortedAllScores.length / 2)];

        setSetsData(processedSets);
        setOverallStats({
          average: overallAverage,
          median: overallMedian,
          minScore: Math.min(...allScores),
          maxScore: globalMaxScore
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) fetchData();
  }, [quizId]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm text-sm">
          <p className="font-medium">Score: {payload[0].payload.score}</p>
          <p>Students: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="text-center p-4">Loading insights...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  if (!setsData.length) return <div className="text-center p-4">No data available</div>;

  return (
    <div className="bg-white rounded-md shadow-sm w-full max-w-5xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 mr-2">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <path d="M3 9h18"></path>
            <path d="M9 21V9"></path>
          </svg>
          <div className="text-gray-700 text-xl font-medium">Exam Insights</div>
        </div>
      </div>

      <div className="space-y-12">
        {setsData.map((setData) => (
          <div key={setData.setNumber}>
            <div className="mb-4 text-center font-medium text-gray-800">
              Set {setData.setNumber} Performance Distribution
            </div>

            <div className="flex flex-row justify-between mb-6 w-full">
              <div className="bg-gray-50 rounded-md p-4 flex flex-col items-center flex-1 mx-1">
                <div className="text-gray-700 mb-1">Set Average</div>
                <div className="font-semibold text-lg">
                  {setData.average.toFixed(2)} / {setData.maxScore} points
                </div>
              </div>
              <div className="bg-gray-50 rounded-md p-4 flex flex-col items-center flex-1 mx-1">
                <div className="text-gray-700 mb-1">Set Median</div>
                <div className="font-semibold text-lg">
                  {setData.median} / {setData.maxScore} points
                </div>
              </div>
              <div className="bg-gray-50 rounded-md p-4 flex flex-col items-center flex-1 mx-1">
                <div className="text-gray-700 mb-1">Set Range</div>
                <div className="font-semibold text-lg">
                  {setData.minScore} - {setData.maxScore} points
                </div>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={setData.histogramData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                  barCategoryGap={1}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="score" 
                    label={{ value: 'Points scored', position: 'bottom', offset: 0 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: '# of respondents', angle: -90, position: 'insideLeft', offset: 10 }}
                    tick={{ fontSize: 12 }}
                    domain={[0, 'dataMax + 2']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#F9A826" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoogleStyleInsights;
