function App() {
  return (
    <div>
      <h1>IT Management System</h1>
      <p>Dashboard</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
        <div style={{ border: '1px solid #ccc', padding: '20px' }}>
          <h3>System Status</h3>
          <p>Online</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px' }}>
          <h3>Tickets</h3>
          <p>5 active</p>
        </div>
      </div>
    </div>
  );
}

export default App;