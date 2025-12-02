import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TaxDirectory from '@/components/TaxDirectory';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main routes with section parameter */}
        <Route path="/" element={<Navigate to="/tax-calculators" replace />} />
        <Route path="/tax-calculators" element={<TaxDirectory />} />
        <Route path="/tax-calculators/:taxType" element={<TaxDirectory />} />
        <Route path="/taxpayer-categories" element={<TaxDirectory />} />
        <Route path="/forms-library" element={<TaxDirectory />} />
        <Route path="/filing-calendar" element={<TaxDirectory />} />
        <Route path="/tax-rates" element={<TaxDirectory />} />
        <Route path="/faqs" element={<TaxDirectory />} />


        {/* Catch all - redirect to tax-calculators */}
        <Route path="*" element={<Navigate to="/tax-calculators" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
