import React from 'react';
import './Reports.css';

const Reports = () => {
  const reportCategories = [
    {
      title: 'Incident Reports',
      reports: [
        { name: 'Incident Summary', description: 'Overview of all incidents' },
        { name: 'SLA Performance', description: 'Service level agreement metrics' },
        { name: 'Resolution Times', description: 'Average incident resolution times' }
      ]
    },
    {
      title: 'Problem Reports', 
      reports: [
        { name: 'Problem Analysis', description: 'Root cause analysis summary' },
        { name: 'Recurring Issues', description: 'Most frequent problem patterns' }
      ]
    },
    {
      title: 'Change Reports',
      reports: [
        { name: 'Change Success Rate', description: 'Percentage of successful changes' },
        { name: 'Change Calendar', description: 'Upcoming scheduled changes' }
      ]
    }
  ];

  return (
    <div className="reports">
      <div className="page-header">
        <div className="header-content">
          <h1>Reports</h1>
          <p className="page-subtitle">Generate and view ITSM reports</p>
        </div>
      </div>

      <div className="reports-grid">
        {reportCategories.map((category, index) => (
          <div key={index} className="report-category">
            <h2>{category.title}</h2>
            <div className="report-list">
              {category.reports.map((report, reportIndex) => (
                <div key={reportIndex} className="report-item">
                  <h3>{report.name}</h3>
                  <p>{report.description}</p>
                  <button className="btn btn-primary">Generate</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;