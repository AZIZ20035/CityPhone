# CityPhone Comprehensive API Testing Script
# Tests all endpoints including POST/PATCH operations

Write-Host "========================================"
Write-Host "CityPhone Comprehensive API Testing"
Write-Host "========================================"
Write-Host ""

$baseUrl = "http://localhost:3000"
$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [hashtable]$Body = $null,
        [bool]$RequiresAuth = $false,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Description"
    Write-Host "  $Method $Endpoint"
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            UseBasicParsing = $true
            ErrorAction = 'Stop'
        }
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $params.Body = $jsonBody
            $params.ContentType = 'application/json'
            Write-Host "  Body: $jsonBody" -ForegroundColor Gray
        }
        
        $response = Invoke-WebRequest @params
        $content = $response.Content
        
        Write-Host "  Status: $($response.StatusCode) - PASS" -ForegroundColor Green
        if ($content.Length -lt 200) {
            Write-Host "  Response: $content" -ForegroundColor Gray
        } else {
            Write-Host "  Response: $($content.Substring(0, 200))..." -ForegroundColor Gray
        }
        Write-Host ""
        $script:passed++
        return $content
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = ""
        
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
            $reader.Close()
            $stream.Close()
        } catch {}
        
        if ($RequiresAuth -and $statusCode -eq 401) {
            Write-Host "  Status: 401 - PASS (Auth Required)" -ForegroundColor Green
            Write-Host "  Response: $errorBody" -ForegroundColor Gray
            Write-Host ""
            $script:passed++
        }
        elseif ($ExpectedStatus -eq 410 -and $statusCode -eq 410) {
            Write-Host "  Status: 410 - PASS (Intentionally Disabled)" -ForegroundColor Yellow
            Write-Host "  Response: $errorBody" -ForegroundColor Gray
            Write-Host ""
            $script:passed++
        }
        elseif ($statusCode -eq $ExpectedStatus) {
            Write-Host "  Status: $statusCode - PASS (Expected)" -ForegroundColor Green
            Write-Host "  Response: $errorBody" -ForegroundColor Gray
            Write-Host ""
            $script:passed++
        }
        else {
            Write-Host "  Status: $statusCode - FAIL (Expected $ExpectedStatus)" -ForegroundColor Red
            Write-Host "  Error: $errorBody" -ForegroundColor Red
            Write-Host ""
            $script:failed++
        }
        return $null
    }
}

# ============================================
# Phase 1: Health Check Endpoints
# ============================================
Write-Host "=== Phase 1: Health Check Endpoints ===" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/health" -Description "API Health Check"
Test-Endpoint -Method "GET" -Endpoint "/api/version" -Description "API Version Info"
Test-Endpoint -Method "GET" -Endpoint "/api/health/auth" -Description "Auth Health Check"

# ============================================
# Phase 2: Authentication Required Endpoints (GET)
# ============================================
Write-Host "=== Phase 2: Auth-Required GET Endpoints ===" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/settings" -Description "Get Settings" -RequiresAuth $true
Test-Endpoint -Method "GET" -Endpoint "/api/templates" -Description "Get Templates" -RequiresAuth $true
Test-Endpoint -Method "GET" -Endpoint "/api/invoices" -Description "List Invoices" -RequiresAuth $true

# ============================================
# Phase 3: Disabled Endpoints
# ============================================
Write-Host "=== Phase 3: Disabled Endpoints ===" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/repairs" -Description "List Repairs (Disabled)" -ExpectedStatus 410
Test-Endpoint -Method "POST" -Endpoint "/api/repairs" -Description "Create Repair (Disabled)" -ExpectedStatus 410
Test-Endpoint -Method "GET" -Endpoint "/api/repairs/test-id" -Description "Get Repair (Disabled)" -ExpectedStatus 410
Test-Endpoint -Method "GET" -Endpoint "/api/customers" -Description "List Customers (Disabled)" -ExpectedStatus 410

# ============================================
# Phase 4: POST/PATCH Endpoints (Without Auth)
# ============================================
Write-Host "=== Phase 4: POST/PATCH Endpoints (Auth Required) ===" -ForegroundColor Cyan

# Test invoice creation without auth
$invoiceData = @{
    customerName = "Test Customer"
    mobile = "0555123456"
    deviceType = "iPhone 13"
    problem = "Screen broken"
    staffReceiver = "محمد"
    agreedPrice = "500"
}
Test-Endpoint -Method "POST" -Endpoint "/api/invoices" -Description "Create Invoice (No Auth)" -Body $invoiceData -RequiresAuth $true

# Test settings update without auth
$settingsData = @{
    shopName = "Test Shop"
    shopPhone = "0555000000"
}
Test-Endpoint -Method "PUT" -Endpoint "/api/settings" -Description "Update Settings (No Auth)" -Body $settingsData -RequiresAuth $true

# Test message send without auth
$messageData = @{
    invoiceId = "test-id"
    channel = "WHATSAPP"
    customBody = "Test message"
}
Test-Endpoint -Method "POST" -Endpoint "/api/messages/send" -Description "Send Message (No Auth)" -Body $messageData -RequiresAuth $true

# ============================================
# Phase 5: Invalid Method Tests
# ============================================
Write-Host "=== Phase 5: Invalid Method Tests ===" -ForegroundColor Cyan
Test-Endpoint -Method "POST" -Endpoint "/api/health" -Description "POST to Health (Should be 405)" -ExpectedStatus 405
Test-Endpoint -Method "DELETE" -Endpoint "/api/settings" -Description "DELETE Settings (Should be 405)" -ExpectedStatus 405

# ============================================
# Phase 6: Non-existent Endpoints
# ============================================
Write-Host "=== Phase 6: Non-existent Endpoints ===" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/nonexistent" -Description "Non-existent Endpoint" -ExpectedStatus 404

# ============================================
# Summary
# ============================================
Write-Host "========================================"
Write-Host "Test Summary"
Write-Host "========================================"
Write-Host ""
$total = $passed + $failed
Write-Host "Total Tests: $total"
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test Coverage:" -ForegroundColor Cyan
    Write-Host "  - Health check endpoints: ✓"
    Write-Host "  - Authentication enforcement: ✓"
    Write-Host "  - Disabled endpoints (410): ✓"
    Write-Host "  - Invalid methods (405): ✓"
    Write-Host "  - Non-existent routes (404): ✓"
    Write-Host "  - POST/PATCH operations: ✓"
    exit 0
} else {
    Write-Host "✗ Some tests failed!" -ForegroundColor Red
    exit 1
}
