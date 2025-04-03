import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, Sun, Moon, X, SortAsc, SortDesc } from 'lucide-react';
import FormField from '../components/FormField';
import mockUsers, { User } from '../config/data';

interface Column {
    key: keyof User;
    label: string;
    sortable: boolean;
}

const Task2:React.FC = () => { 
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [mainCheckbox, setMainCheckbox] = useState<boolean>(false); 
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [useVirtualization, setUseVirtualization] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [usersPerPage, setUsersPerPage] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<'asc' | 'desc'>('asc');
  
  const observerTarget = useRef<null | HTMLDivElement>(null); 
  const totalPages = Math.ceil(totalUsers / usersPerPage); 
  const columns: Column[] = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'balance', label: 'Balance ($)', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'registration', label: 'Registration', sortable: true }, 
  ];
    
  const fetchData = async () => {
    setLoading(true);
    setError(null); 
    try {  
      setTimeout(() => {
        const transformedData = mockUsers;
        setUsers(transformedData);
        setFilteredUsers(transformedData);
        setTotalUsers(transformedData.length);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
    }
  };

  const handleSort = (key: keyof User, ascending: boolean = true): void => { 
    setSortConfig(prev => prev === "asc" ? "desc" : "asc");
    setFilteredUsers(prev => [...prev].sort((a, b) => {
        if (typeof a[key] === "number") {
            return ascending ? (a[key] as number) - (b[key] as number) : (b[key] as number) - (a[key] as number);
        } 
        if (typeof a[key] === "string") {
            return ascending 
                ? (a[key] as string).localeCompare(b[key] as string) 
                : (b[key] as string).localeCompare(a[key] as string);
        }
        return 0;
    }));
};

  const toggleUserSelection = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      setMainCheckbox(false);
    } else {
      setSelectedUsers([...selectedUsers, userId]);
      const visibleIds = displayedUsers.map(u => u.id);
      if (visibleIds.every(id => [...selectedUsers, userId].includes(id))) {
        setMainCheckbox(true);
      }
    }
  };
  
  const toggleAllSelection = () => {
    if (mainCheckbox) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(displayedUsers.map(user => user.id));
    }
    setMainCheckbox(!mainCheckbox);
  };
  
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  }; 
  const formatBalance = (balance: number) => {
    return `$${balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  };  

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(lowercasedSearch) || 
        user.email.toLowerCase().includes(lowercasedSearch) ||
        user.status.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredUsers(filtered);
    }
    setTotalUsers(filteredUsers.length); 
    if (!useVirtualization) {
      setCurrentPage(1);
    }
  }, [searchTerm, users]);  
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    if (!useVirtualization) { 
      const start = (currentPage - 1) * usersPerPage;
      const end = start + usersPerPage;
      setDisplayedUsers(filteredUsers.slice(start, end));
    } else { 
      setDisplayedUsers(filteredUsers.slice(0, currentPage * usersPerPage));
    }
  }, [filteredUsers, currentPage, useVirtualization, usersPerPage]); 
  useEffect(() => {
    if (!useVirtualization || loading || error || currentPage * usersPerPage >= filteredUsers.length) {
      return;
    }
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) { 
          setCurrentPage(prev => prev + 1);
        }
      },
      { root: null, rootMargin: "100px", threshold: 1.0 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [useVirtualization, loading, error, currentPage, filteredUsers.length]);   

  useEffect(() => {
    if (darkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  return (
    <div className={`container mx-auto p-4 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex flex-wrap justify-between items-center p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-center space-x-2 mb-2 sm:mb-0">
            <div className="relative">
              <FormField 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                label='Search'
              /> 
              {searchTerm && (
                <X
                  size={16}
                  className="absolute right-3 top-10 text-gray-400 cursor-pointer"
                  onClick={() => setSearchTerm('')}
                />
              )}
            </div>
            <div className="relative">
              <FormField 
                type="number"
                value={usersPerPage.toString()}
                min='10'
                onChange={(e) => setUsersPerPage(e.target ? parseInt(e.target.value) : 10)}
                placeholder="Input here"
                label='Number user in per page'
              /> 
              {searchTerm && (
                <X
                  size={16}
                  className="absolute right-3 top-10 text-gray-400 cursor-pointer"
                  onClick={() => setSearchTerm('')}
                />
              )}
            </div>
            <div className='flex flex-col gap-1 font-medium dark:text-gray-50 text-black'>
              <label>Sort by name</label>
              <button onClick={() => handleSort("name", sortConfig === "asc" ? true : false)}
                className="p-2 rounded-lg "
              >
                {sortConfig === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
              </button>
            </div>
          </div>
          
          {/* Right side: Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Virtualization</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useVirtualization}
                  onChange={() => {
                    setUseVirtualization(!useVirtualization);
                    setCurrentPage(1);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
        
        {/* Error state */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 m-4 rounded-lg">
            <p className="font-medium">Error loading data</p>
            <p>{error}</p>
            <button 
              onClick={fetchData}
              className="mt-2 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Table content */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="px-4 py-3 text-left">
                    <input 
                      type="checkbox" 
                      checked={mainCheckbox}
                      onChange={toggleAllSelection}
                      className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </th>
                  {columns.map((column) => (
                    <th 
                      key={column.key}
                      className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400" 
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span> 
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((user) => (
                  <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/20">
                    <td className="px-4 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">{user.name}</td>
                    <td className="px-4 py-4 text-gray-800 dark:text-gray-300">{formatBalance(user.balance)}</td>
                    <td className="px-4 py-4 text-gray-800 dark:text-gray-300">
                      <a href={user.email} className='text-blue-400 underline cursor-pointer'>{user.email}</a>
                    </td>
                    <td 
                        className="px-4 py-4 text-gray-800 dark:text-gray-300"
                        title={new Date(user.registration).toLocaleString("vi-VN")}
                    >
                        {formatDate(user.registration)} 
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className={`rounded-full px-4 py-1 text-sm ${
                        user.status === 'Active' && 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' ||
                        user.status === "Inactive" && 'bg-red-100 dark:bg-red-700 text-red-800 dark:text-red-300' ||
                        user.status === "Pending" && 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                          <Pencil size={18} />
                        </button>
                        <button className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination or Infinite Scroll Indicator */}
        {!loading && !error && (
          <div className="flex items-center justify-between border-t dark:border-gray-700 px-4 py-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredUsers.length} results
            </div>
            
            {useVirtualization ? ( 
              <div ref={observerTarget} className="flex justify-center w-full">
                {currentPage * usersPerPage < filteredUsers.length && (
                  <div className="py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            ) : ( 
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded p-1 hover:bg-gray-100 dark:text-gray-50 dark:hover:bg-gray-700 disabled:text-gray-300 dark:disabled:text-gray-600"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`h-8 w-8 rounded ${
                      currentPage === page 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-gray-400">...</span>
                    {[Math.max(6, totalPages - 1), totalPages].map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className="h-8 w-8 rounded dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {page}
                      </button>
                    ))}
                  </>
                )}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded p-1 hover:bg-gray-100 dark:text-gray-50 dark:hover:bg-gray-700 disabled:text-gray-300 dark:disabled:text-gray-600"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Task2;