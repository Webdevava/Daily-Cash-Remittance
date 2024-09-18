'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format, addDays, parse, set } from "date-fns"
import Cookies from 'js-cookie'
import { Plus, Settings, MoreVertical, Calendar as CalendarIcon, Clock, LogOut, Search, Sun, Moon, FileDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from '@/lib/utils'
import MainLayout from '@/components/Layouts/MainLayout'
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export default function RemittancesPage() {
  const [remittances, setRemittances] = useState([])
  const [filteredRemittances, setFilteredRemittances] = useState([])
  const [newRemittance, setNewRemittance] = useState({
    startDate: null,
    startTime: null,
    endTime: null,
    location: '',
    customLocation: ''
  })
  const [editingRemittance, setEditingRemittance] = useState(null)
  const [exportStartDate, setExportStartDate] = useState(null)
  const [exportEndDate, setExportEndDate] = useState(null)
  const [exportLocation, setExportLocation] = useState('All')
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [defaultLocations, setDefaultLocations] = useState(['Mantha-Ashti', 'Shahagad-Karmad', 'Ajintha'])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [newLocation, setNewLocation] = useState('')
  const [searchDate, setSearchDate] = useState(null)
  const [searchLocation, setSearchLocation] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRemittances, setTotalRemittances] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndFetchRemittances = async () => {
      const token = Cookies.get('token')
      if (!token) {
        router.push('/login')
        return
      }
      try {
        await fetchRemittances(1)
        setIsLoading(false)
      } catch (error) {
        console.error('Error:', error)
        if (error.message === 'Unauthorized') {
          Cookies.remove('token')
          Cookies.remove('userId')
          router.push('/login')
        }
      }
    }
    checkAuthAndFetchRemittances()
    const savedTheme = Cookies.get('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.body.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    filterRemittances()
  }, [remittances, searchDate, searchLocation])

  const fetchRemittances = async (page) => {
    const token = Cookies.get('token')
    const response = await fetch(`${API_URL}/api/remittance?page=${page}&limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    if (response.ok) {
      const data = await response.json()
      setRemittances(data.remittances)
      setFilteredRemittances(data.remittances)
      setCurrentPage(data.currentPage)
      setTotalPages(data.totalPages)
      setTotalRemittances(data.totalRemittances)
    } else if (response.status === 401) {
      throw new Error('Unauthorized')
    } else {
      throw new Error('Failed to fetch remittances')
    }
  }

  const handlePageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setIsLoading(true)
      await fetchRemittances(newPage)
      setIsLoading(false)
    }
  }

  const filterRemittances = () => {
    let filtered = remittances
    if (searchDate) {
      filtered = filtered.filter(remittance =>
        remittance.startDate.includes(format(searchDate, 'yyyy-MM-dd'))
      )
    }
    if (searchLocation) {
      filtered = filtered.filter(remittance =>
        remittance.location.toLowerCase().includes(searchLocation.toLowerCase())
      )
    }
    setFilteredRemittances(filtered)
  }

  const handleCreateRemittance = async () => {
    if (!newRemittance.startDate || !newRemittance.startTime || !newRemittance.endTime || (!newRemittance.location && !newRemittance.customLocation)) {
      toast.error('Please fill in all fields')
      return
    }

    const remittanceToCreate = {
      ...newRemittance,
      startDate: format(newRemittance.startDate, 'yyyy-MM-dd'),
      startTime: format(newRemittance.startTime, 'HH:mm'),
      endTime: format(newRemittance.endTime, 'HH:mm'),
      location: newRemittance.location === 'custom' ? newRemittance.customLocation : newRemittance.location
    }

    const token = Cookies.get('token')
    const response = await fetch(`${API_URL}/api/remittance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(remittanceToCreate),
    })
    if (response.ok) {
      await fetchRemittances()
      setNewRemittance({
        startDate: null,
        startTime: null,
        endTime: null,
        location: '',
        customLocation: ''
      })
      toast.success('Remittance created successfully')
    } else {
      toast.error('Failed to create remittance')
    }
  }

  const handleUpdateRemittance = async () => {
    if (!editingRemittance) return
    const token = Cookies.get('token')
    const response = await fetch(`${API_URL}/api/remittance/${editingRemittance._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...editingRemittance,
        startDate: format(editingRemittance.startDate, 'yyyy-MM-dd'),
        startTime: editingRemittance.startTime ? format(parse(editingRemittance.startTime, 'HH:mm', new Date()), 'HH:mm') : null,
        endTime: editingRemittance.endTime ? format(parse(editingRemittance.endTime, 'HH:mm', new Date()), 'HH:mm') : null,
        location: editingRemittance.location === 'custom' ? editingRemittance.customLocation : editingRemittance.location
      }),
    })
    if (response.ok) {
      await fetchRemittances()
      setEditingRemittance(null)
      toast.success('Remittance updated successfully')
    } else {
      toast.error('Failed to update remittance')
    }
  }

  const handleDeleteRemittance = async (id) => {
    const token = Cookies.get('token')
    const response = await fetch(`${API_URL}/api/remittance/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (response.ok) {
      await fetchRemittances()
      toast.success('Remittance deleted successfully')
    } else {
      toast.error('Failed to delete remittance')
    }
  }

  const handleExportRemittances = () => {
    if (!exportStartDate || !exportEndDate) {
      toast.error('Please select both start and end dates')
      return
    }

    const endDatePlusOne = addDays(exportEndDate, 1)

    let filteredRemittances = remittances.filter(remittance => {
      const remittanceDate = new Date(remittance.startDate)
      return remittanceDate >= exportStartDate && remittanceDate < endDatePlusOne
    })

    if (exportLocation !== 'All') {
      filteredRemittances = filteredRemittances.filter(remittance => remittance.location === exportLocation)
    }

    const csvContent = [
      ['Date', 'Location', 'Start Time', 'End Time'],
      ...filteredRemittances.map(remittance => [
        format(new Date(remittance.startDate), 'yyyy-MM-dd'),
        remittance.location,
        remittance.startTime,
        remittance.endTime
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'remittances.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Remittances exported successfully')
    setIsExportOpen(false)
  }

  const handleAddDefaultLocation = async () => {
    if (!newLocation) {
      toast.error('Please enter a location')
      return
    }
    setDefaultLocations([...defaultLocations, newLocation])
    setNewLocation('')
    toast.success('Default location added successfully')
  }

  const name = Cookies.get('name')


  const TimePicker = ({ value, onChange }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const minutes = Array.from({ length: 60 }, (_, i) => i)

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${!value && "text-muted-foreground"}`}
          >
            {value ? format(value, "HH:mm") : <span>Pick a time</span>}
            <Clock className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="grid grid-cols-2 gap-2 p-2">
            <Select
              value={value ? format(value, "HH") : ""}
              onValueChange={(newHour) => {
                const newDate = value ? value : new Date()
                onChange(set(newDate, { hours: parseInt(newHour, 10) }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                    {hour.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={value ? format(value, "mm") : ""}
              onValueChange={(newMinute) => {
                const newDate = value ? value : new Date()
                onChange(set(newDate, { minutes: parseInt(newMinute, 10) }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={minute.toString().padStart(2, '0')}>
                    {minute.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  if (isLoading) {
    return (<div className="flex items-center justify-center h-screen">
      <div
        className={cn(
          "w-16 h-16 border-4 border-dashed rounded-full animate-spin",
          "border-gray-400 border-t-transparent"
        )}
      ></div>
    </div>)

  }

  return (
    <MainLayout>
    <div className="container mx-auto p-4">
        <Toaster />
        <h1 className="text-2xl  font-bold mb-4">Hello, {name}</h1>


      <Card className="mb-8  rounded-md">
        <CardHeader>
          <CardTitle>Create New Remittance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!newRemittance.startDate && "text-muted-foreground"}`}
                  >
                    {newRemittance.startDate ? format(newRemittance.startDate, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newRemittance.startDate}
                    onSelect={(date) => setNewRemittance({ ...newRemittance, startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <TimePicker
                value={newRemittance.startTime}
                onChange={(time) => setNewRemittance({ ...newRemittance, startTime: time })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <TimePicker
                value={newRemittance.endTime}
                onChange={(time) => setNewRemittance({ ...newRemittance, endTime: time })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={newRemittance.location}
                onValueChange={(value) => setNewRemittance({ ...newRemittance, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {defaultLocations.map((location, index) => (
                    <SelectItem key={index} value={location}>{location}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Location</SelectItem>
                </SelectContent>
              </Select>
              {newRemittance.location === 'custom' && (
                <Input
                  className="mt-2"
                  placeholder="Enter custom location"
                  value={newRemittance.customLocation}
                  onChange={(e) => setNewRemittance({ ...newRemittance, customLocation: e.target.value })}
                />
              )}
            </div>
          </div>
          <Button onClick={handleCreateRemittance} className="mt-4 ">
            <Plus className="mr-2 h-4 w-4" /> Create Remittance
          </Button>
        </CardContent>
      </Card>

      {totalRemittances !== 0 ? (
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Remittances List</CardTitle>
            <div className="flex space-x-4">
              <div className="flex-1 flex items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!searchDate && "text-muted-foreground"}`}
                    >
                      {searchDate ? format(searchDate, "PPP") : <span>Search by date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={searchDate}
                      onSelect={setSearchDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {searchDate && (
                  <Button variant="outline" onClick={() => setSearchDate(null)} className="ml-1">
                    <X className="h-4 w-4 " />
                  </Button>
                )}
              </div>
              <div className="flex-1 flex items-center">
                <Input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Search by location"
                />
                {searchLocation && (
                  <Button variant="outline" onClick={() => setSearchLocation('')} className="ml-1">
                    <X className="h-4 w-4 " />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRemittances.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRemittances.map((remittance) => (
                    <TableRow key={remittance._id}>
                      <TableCell>{format(new Date(remittance.startDate), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{remittance.location}</TableCell>
                      <TableCell>{remittance.startTime}</TableCell>
                      <TableCell>{remittance.endTime}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingRemittance(remittance)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteRemittance(remittance._id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center text-muted-foreground text-lg font-bold">
                No Remittances Found
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="flex justify-between items-center gap-4">
              {totalRemittances >= 11 ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="icon"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="icon"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <span>Total Remittances: {totalRemittances}</span>
                </div>
              ) : (
                <span>Total Remittances: {totalRemittances}</span>
              )}
            </div>
            <Drawer open={isExportOpen} onOpenChange={setIsExportOpen}>
              <DrawerTrigger asChild>
                <Button variant="secondary" className=" flex items-center gap-2"> <FileDown className="h-4 w-4" /> Export</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Export Remittances</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col space-y-4 p-4">
                  <div>
                    <Label htmlFor="exportStartDate">Start Date</Label>
                    <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!exportStartDate && "text-muted-foreground"}`}
                        >
                          {exportStartDate ? format(exportStartDate, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={exportStartDate}
                          onSelect={(date) => {
                            setExportStartDate(date)
                            setIsStartDateOpen(false)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="exportEndDate">End Date</Label>
                    <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!exportEndDate && "text-muted-foreground"}`}
                        >
                          {exportEndDate ? format(exportEndDate, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={exportEndDate}
                          onSelect={(date) => {
                            setExportEndDate(date)
                            setIsEndDateOpen(false)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="exportLocation">Location</Label>
                    <Select value={exportLocation} onValueChange={setExportLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Locations</SelectItem>
                        {defaultLocations.map((location, index) => (
                          <SelectItem key={index} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleExportRemittances}>Export CSV</Button>
                </div>
              </DrawerContent>
            </Drawer>
          </CardFooter>
        </Card>) : <div
          className="flex items-center justify-center text-muted-foreground text-lg font-bold"
        >No Remittances Found</div>}

      {editingRemittance && (
        <Drawer open={!!editingRemittance} onOpenChange={() => setEditingRemittance(null)}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edit Remittance</DrawerTitle>
            </DrawerHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editStartDate" className="text-right">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`col-span-3 justify-start text-left font-normal ${!editingRemittance.startDate && "text-muted-foreground"}`}
                    >
                      {editingRemittance.startDate ? format(new Date(editingRemittance.startDate), "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(editingRemittance.startDate)}
                      onSelect={(date) => setEditingRemittance({ ...editingRemittance, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editStartTime" className="text-right">Start Time</Label>
                <div className="col-span-3">
                  <TimePicker
                    value={editingRemittance.startTime ? parse(editingRemittance.startTime, 'HH:mm', new Date()) : null}
                    onChange={(time) => setEditingRemittance({ ...editingRemittance, startTime: format(time, 'HH:mm') })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editEndTime" className="text-right">End Time</Label>
                <div className="col-span-3">
                  <TimePicker
                    value={parse(editingRemittance.endTime, 'HH:mm', new Date())}
                    onChange={(time) => setEditingRemittance({ ...editingRemittance, endTime: time })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editLocation" className="text-right">Location</Label>
                <Select
                  value={editingRemittance.location}
                  onValueChange={(value) => setEditingRemittance({ ...editingRemittance, location: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultLocations.map((location, index) => (
                      <SelectItem key={index} value={location}>{location}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingRemittance.location === 'custom' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editCustomLocation" className="text-right">Custom Location</Label>
                  <Input
                    id="editCustomLocation"
                    className="col-span-3"
                    value={editingRemittance.customLocation || ''}
                    onChange={(e) => setEditingRemittance({ ...editingRemittance, customLocation: e.target.value })}
                  />
                </div>
              )}
            </div>
            <Button onClick={handleUpdateRemittance}>Update</Button>
          </DrawerContent>
        </Drawer>
      )}
    </div>
    </MainLayout>
  )
}