import { useState, useEffect } from 'react';
import type { PressureReport, Delivery, StanceMetricsFile, EventsFile } from './types/pressure-report';
import SessionSummary from './components/SessionSummary';
import DeliveryGallery from './components/DeliveryGallery';
import DeliveryDetail from './components/DeliveryDetail';
import './styles/index.css';

function App() {
  const [report, setReport] = useState<PressureReport | null>(null);
  const [stanceMetrics, setStanceMetrics] = useState<StanceMetricsFile | null>(null);
  const [eventsData, setEventsData] = useState<EventsFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'session' | 'deliveries' | 'delivery-detail'>('session');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    // Load both pressure report and stance metrics
    Promise.all([
      fetch('/pressure_report.json').then(res => {
        if (!res.ok) throw new Error('Failed to load pressure report');
        return res.json();
      }),
      fetch('/stance_metrics.json').then(res => {
        if (!res.ok) throw new Error('Failed to load stance metrics');
        return res.json();
      }),
      fetch('/events.json').then(res => {
        if (!res.ok) throw new Error('Failed to load events data');
        return res.json();
      })
    ])
      .then(([reportData, stanceData, eventsRes]) => {
        setReport(reportData);
        setStanceMetrics(stanceData);
        setEventsData(eventsRes);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSelectDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setView('delivery-detail');
    window.scrollTo(0, 0);
  };

  const handleBackToGallery = () => {
    setSelectedDelivery(null);
    setView('session');
  };

  if (loading) {
    return (
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: 'var(--spacing-md)',
            color: 'var(--primary-orange)'
          }}>
            ⚡
          </div>
          <h2>Loading Pressure Sole Analytics...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div className="card" style={{
          maxWidth: '500px',
          borderLeft: '4px solid var(--warning)'
        }}>
          <h2 style={{ color: 'var(--warning)' }}>Error Loading Data</h2>
          <p>{error}</p>
          <p className="text-sm text-muted">
            Please ensure the pressure_report.json file is in the public folder.
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div className="card">
          <h2>No Data Available</h2>
          <p>Please load a pressure report to view analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        {/* Content */}
        {view === 'session' && (
          <SessionSummary
            report={report}
            stanceMetrics={stanceMetrics || undefined}
            onViewDeliveries={() => setView('deliveries')}
            onSelectDelivery={handleSelectDelivery}
          />
        )}
        {view === 'deliveries' && (
          <DeliveryGallery
            deliveries={report.deliveries}
            stanceMetrics={stanceMetrics || undefined}
            onSelectDelivery={handleSelectDelivery}
            onBackToSession={() => setView('session')}
          />
        )}
        {view === 'delivery-detail' && selectedDelivery && stanceMetrics && eventsData && (
          <DeliveryDetail
            delivery={selectedDelivery}
            stanceMetrics={stanceMetrics}
            eventsFile={eventsData}
            onBack={handleBackToGallery}
          />
        )}
      </div>
    </div>
  );
}

export default App;
