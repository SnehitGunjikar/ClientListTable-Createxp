import { useState, useMemo, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SortDropdown from './components/SortDropdown'

const MOCK_CLIENTS = [
  { id: 10, name: 'John Doe', type: 'Individual', email: 'johndoe@email.com', status: 'Active', createdAt: '2024-01-15', updatedAt: '2024-01-20T14:45', updatedBy: 'Admin' },
  { id: 11, name: 'Test Test', type: 'Individual', email: 'test@test.com', status: 'Active', createdAt: '2024-01-10', updatedAt: '2024-01-18T16:20', updatedBy: 'Admin' },
  { id: 12, name: 'Matty Jason', type: 'Company', email: 'Matty@Jason.com', status: 'Inactive', createdAt: '2024-01-05', updatedAt: '2024-01-25T11:30', updatedBy: 'Admin 2' },
  { id: 13, name: 'Bruke Lancer', type: 'Individual', email: 'brukelancer@email.com', status: 'Active', createdAt: '2024-01-20', updatedAt: '2024-01-22T09:10', updatedBy: 'system' },
  { id: 14, name: 'Cicily Inc', type: 'Company', email: 'contact@cicily.com', status: 'Active', createdAt: '2024-01-12', updatedAt: '2024-01-24T15:55', updatedBy: 'manager' },
  { id: 15, name: 'Sammy Wills', type: 'Individual', email: 'sammyw@email.com', status: 'Inactive', createdAt: '2024-01-08', updatedAt: '2024-01-15T10:25', updatedBy: 'admin 2' },
  { id: 16, name: 'Techno Games Pvt Ltd', type: 'Company', email: 'info@technogames.com', status: 'Active', createdAt: '2024-01-25', updatedAt: '2024-01-26T12:40', updatedBy: 'system' },
  { id: 17, name: 'Jitu Brown', type: 'Individual', email: 'brownjitu@email.com', status: 'Active', createdAt: '2024-01-03', updatedAt: '2024-01-28T18:15', updatedBy: 'manager' },
  { id: 18, name: 'Eliana Patel', type: 'Company', email: 'eliana@patel.com', status: 'Inactive', createdAt: '2024-01-18', updatedAt: '2024-01-20T17:30', updatedBy: 'manager' },
  { id: 19, name: 'Elie Patel', type: 'Company', email: 'eli@patel.com', status: 'Inactive', createdAt: '2024-01-18', updatedAt: '2024-01-20T17:30', updatedBy: 'manager 2' },
];

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Individual', value: 'Individual' },
  { label: 'Company', value: 'Company' },
];

const SORT_FIELDS = [
  {
    key: 'name',
    label: 'Client Name',
    icon: (
      <svg className="inline mr-2" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 8l-4 4-4-4"/></svg>
    ),
    options: [
      { label: 'A-Z', value: 'asc' },
      { label: 'Z-A', value: 'desc' },
    ],
  },
  {
    key: 'createdAt',
    label: 'Created At',
    icon: (
      <svg className="inline mr-2" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
    ),
    options: [
      { label: 'Newest to Oldest', value: 'desc' },
      { label: 'Oldest to Newest', value: 'asc' },
    ],
  },
  {
    key: 'updatedAt',
    label: 'Updated At',
    icon: (
      <svg className="inline mr-2" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
    ),
    options: [
      { label: 'Newest to Oldest', value: 'desc' },
      { label: 'Oldest to Newest', value: 'asc' },
    ],
  },
  {
    key: 'id',
    label: 'Client ID',
    icon: (
      <svg className="inline mr-2" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M9 9h6v6H9z"/></svg>
    ),
    options: [
      { label: 'A-Z', value: 'asc' },
      { label: 'Z-A', value: 'desc' },
    ],
  },
];

function formatDate(dateStr, withTime = false) {
  const d = new Date(dateStr);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  let date = d.toLocaleDateString('en-US', options);
  if (withTime) {
    // Extract hours and minutes from the time part of the string
    const timeParts = dateStr.split('T')[1].split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];

    // Format as 12-hour time with AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const formattedHour = hour12.toString().padStart(2, '0');

    return `${date}, ${formattedHour}:${minutes} ${period}`;
  }
  return date;
}

function App() {
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ field: 'name', direction: 'asc' });
  const [sortOpen, setSortOpen] = useState(false);
  const [sortFields, setSortFields] = useState(SORT_FIELDS);
  const sortRef = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    }
    if (sortOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sortOpen]);

  const filteredClients = useMemo(() => {
    let data = MOCK_CLIENTS;
    if (tab !== 'all') data = data.filter(c => c.type === tab);
    if (search) data = data.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
    // Sort logic
    data = [...data].sort((a, b) => {
      let aVal = a[sort.field];
      let bVal = b[sort.field];
      if (sort.field === 'createdAt' || sort.field === 'updatedAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [tab, search, sort]);

  const allSelected = filteredClients.length > 0 && selected.length === filteredClients.length;

  function toggleSelectAll() {
    if (allSelected) setSelected([]);
    else setSelected(filteredClients.map(c => c.id));
  }
  
  function toggleSelect(id) {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  }
  
  function handleSortChange(field, direction) {
    setSort({ field, direction });
    setSortOpen(false);
  }

  return (
    <div className="min-h-screen bg-white w-full">
      {/*I have implemented the Header/Top part of the page*/}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <div className='flex items-center gap-3 relative'>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <img width="20" height="20" src="https://img.icons8.com/ios-filled/50/search--v1.png" alt="search--v1" />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <img width="20" height="20" src="https://img.icons8.com/ios/50/filter--v1.png" alt="filter--v1" />
          </button>
          <button
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setSortOpen(v => !v)}
            aria-label="Sort"
          >
            <img width="20" height="20" src="https://img.icons8.com/ios/50/sorting-arrows.png" alt="sorting-arrows" />
          </button>
          
          {/* Updated Sort Dropdown with dnd-kit */}
          <SortDropdown 
            isOpen={sortOpen}
            sortRef={sortRef}
            sortFields={sortFields}
            currentSort={sort}
            onSortChange={handleSortChange}
            onClose={() => setSortOpen(false)}
          />
          
          <button className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Client
          </button>
        </div>
      </div>
      {/* I have implemented Tabs with the help of Tailwind CSS and React here*/}
      <div className="flex gap-6 border-b border-gray-200 mb-4">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`py-2 px-1 border-b-2 transition-colors duration-150 ${tab === t.value ? 'border-black text-gray-900 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* I have implemented Table with the help of Tailwind CSS and React here*/}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Type</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated By</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClients.map(client => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(client.id)}
                      onChange={() => toggleSelect(client.id)}
                      className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:underline">{client.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{client.type}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{client.email}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status === 'Active' ? 'bg-green-100 text-green-800 status-active' : 'bg-gray-100 text-gray-800'}`}>
                    <span className={`h-2 w-2 mr-1.5 rounded-full status-dot ${client.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {client.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(client.createdAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(client.updatedAt, true)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{client.updatedBy}</td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="mt-2 text-sm">No clients found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App
