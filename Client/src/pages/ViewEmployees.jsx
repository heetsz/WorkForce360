import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const base_url = import.meta.env.VITE_BACKEND_URL;

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${base_url}/get-employees`);
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleDelete = async (cid) => {
    try {
      await axios.delete(`${base_url}/delete-employee/${cid}`);
      toast.success(`Employee with CID ${cid} has been removed.`);
      fetchEmployees();
    } catch (err) {
      console.error("Error deleting employee:", err);
      toast.error(err.response?.data?.message || "Failed to delete employee. Try again later.");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Your Employees</h1>
          <p className="text-sm text-muted-foreground">
            Manage and view all employees in your organization
          </p>
        </div>
        <Button onClick={() => navigate("/add-employee")} size="default">
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Separator />

      {/* Employee Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">All Employees</CardTitle>
            <Badge variant="secondary" className="text-sm">
              {employees.length} {employees.length === 1 ? "Employee" : "Employees"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="border-t">
            {/* Table Header */}
            <div className="grid grid-cols-[70px_90px_130px_150px_160px_120px_90px_70px_90px_60px] gap-4 px-6 py-3 bg-muted/50 font-medium text-sm border-b">
              <div>Photo</div>
              <div>CID</div>
              <div>Name</div>
              <div>Role</div>
              <div>Email</div>
              <div>Phone</div>
              <div>Salary</div>
              <div>Gender</div>
              <div>DOB</div>
              <div>Delete</div>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="h-[calc(100vh-340px)]">
              {employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <User className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm font-medium">No employees found</p>
                  <p className="text-xs mt-1">
                    Add your first employee to get started
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {employees.map((emp, index) => (
                    <div
                      key={emp._id || index}
                      className="grid grid-cols-[70px_90px_130px_150px_160px_120px_90px_70px_90px_60px] gap-4 px-6 py-4 hover:bg-muted/30 transition-colors items-center"
                    >
                      <div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={emp.picture} alt={emp.name} />
                          <AvatarFallback className="text-xs">
                            {getInitials(emp.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="font-mono text-sm">{emp.CID}</div>
                      <div
                        className="font-medium truncate cursor-pointer"
                        onClick={() => navigate(`/employee/${emp._id}`)}
                      >
                        {emp.name}
                      </div>
                      <div>
                        <Badge variant="outline" className="font-normal">
                          {emp.role}
                        </Badge>
                      </div>
                      <div className="text-sm truncate">{emp.email}</div>
                      <div className="text-sm">{emp.phoneNumber}</div>
                      <div className="font-medium text-sm">
                        ₹{emp.salary?.toLocaleString("en-IN")}
                      </div>
                      <div className="text-sm">{emp.gender || "-"}</div>
                      <div className="text-sm">
                        {emp.dob
                          ? new Date(emp.dob).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          : "-"}
                      </div>
                      <div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(emp.CID)}
                          className="h-8 w-8 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}