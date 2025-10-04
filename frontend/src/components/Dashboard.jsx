import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  LogOut,
  Lock,
  Unlock,
  Trash2,
  Eraser,
  RefreshCw,
} from "lucide-react";
import { userAPI, authAPI, apiUtils } from "../utils/api";

const Dashboard = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [sorting, setSorting] = useState([{ id: "last_login", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const currentUser = apiUtils.getCurrentUser();

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getUsers();
      setUsers(response.data.users || []);
      setMessage({ type: "", text: "" });
    } catch (error) {
      setMessage({
        type: "error",
        text: apiUtils.getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((user) => user.id)));
    }
  };

  const filteredUsers = useMemo(() => {
    if (statusFilter === "all") return users;
    return users.filter((user) => user.status === statusFilter);
  }, [users, statusFilter]);

  const handleBulkAction = async (action) => {
    if (selectedUsers.size === 0) {
      setMessage({ type: "error", text: "Please select users first" });
      return;
    }

    const userIds = Array.from(selectedUsers);
    setIsLoading(true);

    try {
      let successMessage;

      switch (action) {
        case "block":
          await userAPI.blockUsers(userIds);
          successMessage = `Successfully blocked ${userIds.length} user(s)`;
          break;
        case "unblock":
          await userAPI.unblockUsers(userIds);
          successMessage = `Successfully unblocked ${userIds.length} user(s)`;
          break;
        case "delete":
          await userAPI.deleteUsers(userIds);
          successMessage = `Successfully deleted ${userIds.length} user(s)`;
          break;
        default:
          throw new Error("Invalid action");
      }

      setMessage({ type: "success", text: successMessage });
      setSelectedUsers(new Set());
      await loadUsers();
    } catch (error) {
      setMessage({
        type: "error",
        text: apiUtils.getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUnverified = async () => {
    setIsLoading(true);

    try {
      await userAPI.deleteUnverified();
      setMessage({
        type: "success",
        text: "Successfully deleted unverified users",
      });
      await loadUsers();
    } catch (error) {
      setMessage({
        type: "error",
        text: apiUtils.getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "less than a minute ago";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hour${
        Math.floor(diffInMinutes / 60) > 1 ? "s" : ""
      } ago`;

    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "blocked":
        return "bg-red-100 text-red-800 border-red-200";
      case "unverified":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.display({
      id: "select",
      header: () => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          checked={
            selectedUsers.size === filteredUsers.length &&
            filteredUsers.length > 0
          }
          onChange={toggleSelectAll}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          checked={selectedUsers.has(row.original.id)}
          onChange={() => toggleUserSelection(row.original.id)}
        />
      ),
      enableSorting: false,
      size: 50,
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ getValue, row }) => (
        <div>
          <div className="font-medium text-gray-900">{getValue()}</div>
          {row.original.email === currentUser?.email && (
            <div className="text-xs text-gray-500">(You)</div>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: ({ getValue }) => <div className="text-gray-600">{getValue()}</div>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(
            getValue()
          )}`}
        >
          {getValue().charAt(0).toUpperCase() + getValue().slice(1)}
        </span>
      ),
    }),
    columnHelper.accessor("last_login", {
      header: "Last Login",
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-600">{formatDate(getValue())}</div>
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and title */}
            <div className="flex items-center">
              <div className="text-xl font-bold text-primary-600 mr-8">
                THE APP
              </div>
              <h1 className="text-lg font-semibold text-gray-800">
                User Management
              </h1>
            </div>

            {/* User info and logout */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {currentUser?.name}
              </div>
              <button
                onClick={() => {
                  authAPI.logout();
                  onLogout();
                }}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="unverified">Unverified</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Search */}
            <input
              type="text"
              placeholder="Search users..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
            />
          </div>

          {/* Refresh button */}
          <button
            onClick={loadUsers}
            disabled={isLoading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-3">
              Actions ({selectedUsers.size} selected):
            </span>

            <button
              onClick={() => handleBulkAction("block")}
              disabled={selectedUsers.size === 0 || isLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Block selected users"
            >
              <Lock className="h-4 w-4" />
              <span>Block</span>
            </button>

            <button
              onClick={() => handleBulkAction("unblock")}
              disabled={selectedUsers.size === 0 || isLoading}
              className="inline-flex items-center justify-center w-9 h-9 text-blue-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Unblock selected users"
            >
              <Unlock className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleBulkAction("delete")}
              disabled={selectedUsers.size === 0 || isLoading}
              className="inline-flex items-center justify-center w-9 h-9 text-red-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-red-50 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete selected users"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={handleDeleteUnverified}
              disabled={isLoading}
              className="inline-flex items-center justify-center w-9 h-9 text-orange-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-orange-50 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete all unverified users"
            >
              <Eraser className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="table-header cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ width: header.getSize() }}
                      >
                        <div className="flex items-center space-x-1">
                          <span>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </span>
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {{
                                asc: <ChevronUp className="h-4 w-4" />,
                                desc: <ChevronDown className="h-4 w-4" />,
                              }[header.column.getIsSorted()] ?? (
                                <div className="flex flex-col">
                                  <ChevronUp className="h-3 w-3 -mb-1" />
                                  <ChevronDown className="h-3 w-3" />
                                </div>
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="table-cell text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="table-cell text-center py-8 text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="table-cell">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Info */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {table.getRowModel().rows.length} of {users.length} users
          {selectedUsers.size > 0 && ` (${selectedUsers.size} selected)`}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
