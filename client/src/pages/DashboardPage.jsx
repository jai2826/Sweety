import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { todayString } from '../lib/format.js';
import { Button, Card, Alert, Field, Input } from '../components/ui.jsx';
import ReadingForm from '../components/ReadingForm.jsx';
import ReadingsTable from '../components/ReadingsTable.jsx';
import Pagination from '../components/Pagination.jsx';
import ReportsPanel from '../components/ReportsPanel.jsx';

const PAGE_SIZE = 10;

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [selectedDate, setSelectedDate] = useState(todayString());
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [listData, setListData] = useState(null);
  const [report, setReport] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  // Load the paginated readings list.
  useEffect(() => {
    let active = true;
    api
      .listReadings({ page, limit: PAGE_SIZE })
      .then((data) => active && setListData(data))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [page, reloadKey]);

  // Load the reports for the selected date.
  useEffect(() => {
    let active = true;
    api
      .reports(selectedDate)
      .then((data) => active && setReport(data))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [selectedDate, reloadKey]);

  const handleCreate = async (payload) => {
    await api.createReading(payload);
    setError('');
    reload();
  };

  const handleUpdate = async (payload) => {
    await api.updateReading(editing.id, payload);
    setEditing(null);
    setError('');
    reload();
  };

  const handleDelete = async (reading) => {
    if (!window.confirm(`Delete the ${reading.slotLabel} reading?`)) return;
    try {
      await api.deleteReading(reading.id);
      setError('');
      // Step back a page if we just emptied the last one.
      if (listData?.data.length === 1 && page > 1) setPage((p) => p - 1);
      else reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-brand-700">Sweety</h1>
            <p className="text-xs text-slate-500">Blood glucose tracker</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">Hi, {user?.name}</span>
            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {error && <Alert>{error}</Alert>}

        {/* Add / edit reading */}
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-800">
            {editing ? 'Edit reading' : 'Add a reading'}
          </h2>
          <ReadingForm
            key={editing?.id ?? 'new'}
            initial={editing}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={editing ? () => setEditing(null) : undefined}
          />
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Readings list */}
          <Card>
            <h2 className="mb-4 text-base font-semibold text-slate-800">Your readings</h2>
            <ReadingsTable
              readings={listData?.data ?? []}
              onEdit={(r) => {
                setEditing(r);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDelete={handleDelete}
            />
            <Pagination pagination={listData?.pagination} onPageChange={setPage} />
          </Card>

          {/* Reports */}
          <Card>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-slate-800">Reports</h2>
              <Field label="" htmlFor="report-date">
                <Input
                  id="report-date"
                  type="date"
                  max={todayString()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </Field>
            </div>
            <ReportsPanel report={report} />
          </Card>
        </div>
      </main>
    </div>
  );
}
