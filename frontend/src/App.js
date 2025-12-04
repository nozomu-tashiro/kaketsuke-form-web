import React from 'react';
import ApplicationForm from './components/ApplicationForm';
import './styles/App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>駆付けサービス 入会申込書作成システム</h1>
        <p className="subtitle">オンラインで申込書を作成し、PDFで出力できます</p>
      </header>
      <main className="App-main">
        <ApplicationForm />
      </main>
      <footer className="App-footer">
        <p>&copy; 2024 駆付けサービス入会申込システム. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
