import React from 'react';

const Copyright: React.FC = () => {
  // Use a script to set the year client-side to avoid hydration mismatch
  const setYearScript = `document.getElementById('copyright-year').textContent = new Date().getFullYear();`;

  return (
    <footer className="bg-gray-100 text-center py-4 mt-auto">
      <p className="text-sm text-gray-600">
        &copy; <span id="copyright-year">{new Date().getFullYear()}</span> Malikli1992. All rights reserved.
      </p>
      <script dangerouslySetInnerHTML={{ __html: setYearScript }} />
    </footer>
  );
};

export default Copyright;