# CityPhone API Endpoint Testing Script
Write-Host "========================================"
Write-Host "CityPhone API Endpoint Testing"
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
        [bool]$RequiresAuth = $false,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Description"
    Write-Host "  $Method $Endpoint"
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$Endpoint" -Method $Method -UseBasicParsing -ErrorAction Stop
        $content = $response.Content
        
        Write-Host "  Status: $($response.StatusCode) - PASS" -ForegroundColor Green
        Write-Host "  Response: $content"
        Write-Host ""
        $script:passed++
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
            Write-Host "  Response: $errorBody"
            Write-Host ""
            $script:passed++
        }
        elseif ($ExpectedStatus -eq 410 -and $statusCode -eq 410) {
            Write-Host "  Status: 410 - PASS (Intentionally Disabled)" -ForegroundColor Yellow
            Write-Host "  Response: $errorBody"
            Write-Host ""
            $script:passed++
        }
        else {
            Write-Host "  Status: $statusCode - FAIL" -ForegroundColor Red
            Write-Host "  Error: $errorBody"
            Write-Host ""
            $script:failed++
        }
    }
}

# Health Check Endpoints
Write-Host "=== Health Check Endpoints ===" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/health" -Description "API Health Check"
Test-Endpoint -Method "GET" -Endpoint "/api/version" -Description "API Version Info"
Test-Endpoint -Method "GET" -Endpoint "/api/health/auth" -Description "Auth Health Check" -RequiresAuth $true

# Settings Endpoints
Write-Host "=== Settings Endpoints ===" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/settings" -Description "Get Settings" -RequiresAuth $true

# Template Endpoints
Write-Host "=== Template Endpoints ===" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/templates" -Description "Get Templates" -RequiresAuth $true

# Invoice Endpoints
Write-Host "=== Invoice Endpoints ===" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/invoices" -Description "List Invoices" -RequiresAuth $true

# Repair Endpoints (Disabled)
Write-Host "=== Repair Endpoints (Disabled) ===" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/repairs" -Description "List Repairs" -ExpectedStatus 410
Test-Endpoint -Method "GET" -Endpoint "/api/repairs/test-id" -Description "Get Repair" -ExpectedStatus 410

# Customer Endpoints (Disabled)
Write-Host "=== Customer Endpoints (Disabled) ===" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/customers" -Description "List Customers" -ExpectedStatus 410

# Summary
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
    Write-Host "All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed!" -ForegroundColor Red
    exit 1
}
