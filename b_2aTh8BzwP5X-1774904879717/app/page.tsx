"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Truck, CheckCircle, Clock, Box, Home, Building2, CalendarDays, MessageSquare, ChevronDown, ChevronUp, Send, AlertCircle, HelpCircle } from "lucide-react"

type POData = {
  poNumber: string
  sapStatus: string
  mondayStatus: string
  deliveryType: "HOME" | "OFFICE"
  dispatchEligibility: string
  items: string[]
  orderStatus: string
}

const MONDAY_STATUSES = [
  "En espera de mercancía",
  "Mercancía disponible en almacén",
  "En proceso",
  "Pendiente",
] as const

type MondayStatus = typeof MONDAY_STATUSES[number]

function getOrderStatus(sapStatus: string, mondayStatus: MondayStatus, dispatchEligibility: string): string {
  if (dispatchEligibility === "Eligible") {
    return "Ready for dispatch"
  }
  if (sapStatus === "No Stock") {
    return "Waiting for inventory"
  }
  if (mondayStatus === "En espera de mercancía") {
    return "Order processing"
  }
  if (mondayStatus === "Mercancía disponible en almacén") {
    return "Preparing shipment"
  }
  return "Order processing"
}

function getPOData(poNumber: string): POData {
  const lastDigit = poNumber.slice(-1)
  
  // Determine SAP status based on last digit
  const sapStatus = lastDigit === "0" || lastDigit === "5" ? "No Stock" : "Released"
  
  // Determine Monday status based on last digit
  const mondayStatusIndex = parseInt(lastDigit) % 4
  const mondayStatus: MondayStatus = MONDAY_STATUSES[mondayStatusIndex]
  
  // Determine dispatch eligibility based on statuses
  const dispatchEligibility = 
    sapStatus === "Released" && mondayStatus === "Mercancía disponible en almacén" 
      ? "Eligible" 
      : "Not Eligible"

  const baseData = {
    poNumber,
    sapStatus,
    mondayStatus,
    dispatchEligibility,
    orderStatus: getOrderStatus(sapStatus, mondayStatus, dispatchEligibility),
  }

  switch (lastDigit) {
    case "1":
      return {
        ...baseData,
        items: ["Laptop", "Monitor"],
        deliveryType: "HOME",
      }
    case "2":
      return {
        ...baseData,
        items: ["Laptop", "Mouse", "Keyboard"],
        deliveryType: "OFFICE",
      }
    case "3":
      return {
        ...baseData,
        items: ["Laptop", "Chair"],
        deliveryType: "HOME",
      }
    case "4":
      return {
        ...baseData,
        items: ["Laptop"],
        deliveryType: "OFFICE",
      }
    default:
      return {
        ...baseData,
        items: ["Laptop"],
        deliveryType: "OFFICE",
      }
  }
}

// PO must be MX followed by at least 4 digits
const PO_REGEX = /^MX\d{4,}$/

function isValidPOFormat(po: string): boolean {
  return PO_REGEX.test(po)
}

// Mock list of valid PO numbers for demo
const VALID_PO_NUMBERS = ["MX12345", "MX00012", "MX987654", "MX11111", "MX22222", "MX33333", "MX44444", "MX55555"]

export default function TraceLogix() {
  const [poNumber, setPoNumber] = useState("")
  const [poData, setPOData] = useState<POData | null>(null)
  const [validationError, setValidationError] = useState("")
  const [poNotFound, setPoNotFound] = useState(false)
  const [systemError, setSystemError] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestType, setRequestType] = useState("")
  const [requestMessage, setRequestMessage] = useState("")
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  const handleCheckPO = () => {
    // Reset all states
    setPoNotFound(false)
    setSystemError(false)
    setPOData(null)
    
    if (!poNumber.trim()) {
      setValidationError("")
      setHasSearched(false)
      return
    }
    
    if (!isValidPOFormat(poNumber)) {
      setValidationError("Invalid PO format. Use MX followed by numbers (example: MX12345).")
      setHasSearched(true)
      return
    }
    
    setValidationError("")
    setHasSearched(true)
    
    // Simulate system error for PO ending in 9
    if (poNumber.endsWith("9")) {
      setSystemError(true)
      return
    }
    
    // Check if PO exists (mock validation)
    if (!VALID_PO_NUMBERS.includes(poNumber)) {
      setPoNotFound(true)
      return
    }
    
    setPOData(getPOData(poNumber))
  }

  const handleSubmitRequest = () => {
    if (requestType && requestMessage.trim()) {
      setRequestSubmitted(true)
      // Reset form after submission
      setTimeout(() => {
        setShowRequestForm(false)
        setRequestType("")
        setRequestMessage("")
        setRequestSubmitted(false)
      }, 2000)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase()
    // Allow only MX prefix followed by numbers
    if (value.length <= 2) {
      // Allow typing M or MX
      value = value.replace(/[^MX]/g, "")
    } else {
      // After MX, only allow numbers
      const prefix = value.slice(0, 2)
      const rest = value.slice(2).replace(/\D/g, "")
      value = prefix + rest
    }
    setPoNumber(value)
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-6">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">TraceLogix</h1>
              <p className="text-sm text-muted-foreground">PO tracking and delivery visibility</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Search Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Search className="h-4 w-4 text-muted-foreground" />
              Track Your Order
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="po-input">Enter PO number</Label>
              <Input
                id="po-input"
                type="text"
                placeholder="e.g. MX12345"
                value={poNumber}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleCheckPO()}
                className={validationError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {validationError && (
                <p className="text-xs text-red-500">{validationError}</p>
              )}
            </div>
            <Button onClick={handleCheckPO} className="w-full">
              Check PO
            </Button>
          </CardContent>
        </Card>

        {/* Empty State - Before Search */}
        {!hasSearched && !poData && (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <HelpCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Enter your PO number to track the current order status.
              </p>
            </CardContent>
          </Card>
        )}

        {/* System Error State */}
        {systemError && (
          <Card className="mt-4 border-red-200">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                <AlertCircle className="h-7 w-7 text-red-600" />
              </div>
              <p className="mt-4 font-medium text-foreground">System Unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Unable to retrieve order information right now. Please try again later.
              </p>
            </CardContent>
          </Card>
        )}

        {/* PO Not Found State */}
        {poNotFound && (
          <Card className="mt-4 border-amber-200">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
                <Search className="h-7 w-7 text-amber-600" />
              </div>
              <p className="mt-4 font-medium text-foreground">PO Not Found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Please verify the PO number or contact support.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Result Card */}
        {poData && (
          <Card className="mt-4">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Truck className="h-4 w-4 text-muted-foreground" />
                PO Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {/* PO Number */}
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">PO Number</p>
                    <p className="mt-0.5 font-mono font-semibold text-foreground">{poData.poNumber}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-500/10">
                    <Box className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Items</p>
                    <ul className="mt-1.5 flex flex-col gap-1">
                      {poData.items.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Delivery Type */}
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-violet-500/10">
                    {poData.deliveryType === "HOME" ? (
                      <Home className="h-4 w-4 text-violet-600" />
                    ) : (
                      <Building2 className="h-4 w-4 text-violet-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Delivery Type</p>
                    <div className="mt-1.5">
                      <Badge
                        className={
                          poData.deliveryType === "HOME"
                            ? "bg-emerald-600 text-white hover:bg-emerald-600"
                            : "bg-blue-600 text-white hover:bg-blue-600"
                        }
                      >
                        {poData.deliveryType === "HOME" ? (
                          <Home className="mr-1.5 h-3 w-3" />
                        ) : (
                          <Building2 className="mr-1.5 h-3 w-3" />
                        )}
                        {poData.deliveryType}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Ready for Shipping */}
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                    poData.dispatchEligibility === "Eligible" 
                      ? "bg-emerald-500/10" 
                      : poData.dispatchEligibility === "Blocked"
                      ? "bg-red-500/10"
                      : "bg-amber-500/10"
                  }`}>
                    <CheckCircle className={`h-4 w-4 ${
                      poData.dispatchEligibility === "Eligible" 
                        ? "text-emerald-600" 
                        : poData.dispatchEligibility === "Blocked"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ready for Shipping</p>
                    <div className="mt-1.5">
                      <Badge className={
                        poData.dispatchEligibility === "Eligible"
                          ? "bg-emerald-600 text-white hover:bg-emerald-600"
                          : poData.dispatchEligibility === "Blocked"
                          ? "bg-red-600 text-white hover:bg-red-600"
                          : "bg-amber-500 text-white hover:bg-amber-500"
                      }>
                        {poData.dispatchEligibility === "Eligible" 
                          ? "Yes" 
                          : poData.dispatchEligibility === "Blocked"
                          ? "Blocked"
                          : "Not yet"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Expected Dispatch */}
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-500/10">
                    <CalendarDays className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Expected Dispatch</p>
                    <p className="mt-0.5 font-semibold text-foreground">
                      {poData.dispatchEligibility === "Eligible" && poData.deliveryType === "HOME"
                        ? "Monday"
                        : poData.dispatchEligibility === "Eligible" && poData.deliveryType === "OFFICE"
                        ? "Tuesday / Thursday Office Delivery"
                        : poData.sapStatus === "No Stock"
                        ? "Pending inventory confirmation"
                        : "Pending confirmation"}
                    </p>
                  </div>
                </div>

                {/* Order Status */}
                <div className="flex items-start gap-3 rounded-lg border-2 border-primary/20 bg-primary/5 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Truck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Order Status</p>
                    <p className="mt-0.5 font-semibold text-primary">{poData.orderStatus}</p>
                  </div>
                </div>

                {/* Last Update */}
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-500/10">
                    <Clock className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last Update</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">Today, 2:35 PM</p>
                  </div>
                </div>
              </div>

              {/* Request Update Section */}
              <div className="mt-6 border-t border-border pt-6">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowRequestForm(!showRequestForm)}
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Request Update
                  </span>
                  {showRequestForm ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {showRequestForm && (
                  <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
                    {requestSubmitted ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                          <CheckCircle className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="font-medium text-foreground">Request Submitted Successfully</p>
                        <p className="text-sm text-muted-foreground">Our team will review it shortly.</p>
                      </div>
                    ) : (
                      <>
                        <p className="mb-4 text-sm text-muted-foreground">
                          If you need to change delivery details or report an issue, send a request and our team will review it.
                        </p>

                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="request-type">Request Type</Label>
                            <Select value={requestType} onValueChange={setRequestType}>
                              <SelectTrigger id="request-type">
                                <SelectValue placeholder="Select a request type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="change-address">Change delivery address</SelectItem>
                                <SelectItem value="delivery-date">Delivery date request</SelectItem>
                                <SelectItem value="report-issue">Report an issue</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Label htmlFor="request-message">Message</Label>
                            <Textarea
                              id="request-message"
                              placeholder="Describe your request..."
                              value={requestMessage}
                              onChange={(e) => setRequestMessage(e.target.value)}
                              rows={3}
                            />
                          </div>

                          <Button
                            onClick={handleSubmitRequest}
                            disabled={!requestType || !requestMessage.trim()}
                            className="w-full"
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Send Request
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}


      </div>
    </main>
  )
}
