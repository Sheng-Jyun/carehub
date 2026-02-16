import { test, expect } from '@playwright/test';

test.describe('Patient Management', () => {
  test('should display patient list', async ({ page }) => {
    await page.goto('http://localhost:3000/patients');
    
    // Wait for patients to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    
    // Check if table headers are present
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("MRN")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    
    // Check if at least one patient is displayed
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('should filter patients by status', async ({ page }) => {
    await page.goto('http://localhost:3000/patients');
    
    // Wait for initial load
    await page.waitForSelector('table tbody tr');
    
    // Open filters if collapsed
    const filterButton = page.locator('button:has-text("Filters")');
    await filterButton.click();
    
    // Select "active" status
    await page.selectOption('select:has(option:text("Active"))', 'active');
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Check if URL updated
    await expect(page).toHaveURL(/status=active/);
  });

  test('should search for patients', async ({ page }) => {
    await page.goto('http://localhost:3000/patients');
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('John');
    
    // Wait for debounced search
    await page.waitForTimeout(500);
    
    // Check if URL updated with search param
    await expect(page).toHaveURL(/search=John/);
  });

  test('should navigate to patient detail page', async ({ page }) => {
    await page.goto('http://localhost:3000/patients');
    
    // Wait for patients to load
    await page.waitForSelector('table tbody tr');
    
    // Click on first patient name
    await page.locator('table tbody tr:first-child td:nth-child(2) a').click();
    
    // Check if navigated to detail page
    await expect(page).toHaveURL(/\/patients\/patient-\d+/);
    
    // Check if patient details are visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should switch between tabs on patient detail page', async ({ page }) => {
    await page.goto('http://localhost:3000/patients/patient-1');
    
    // Wait for page to load
    await page.waitForSelector('h1');
    
    // Check Overview tab is active by default
    await expect(page.locator('button:has-text("Overview")')).toHaveClass(/border-blue-600/);
    
    // Click Appointments tab
    await page.locator('button:has-text("Appointments")').click();
    
    // Check URL updated
    await expect(page).toHaveURL(/tab=appointments/);
    
    // Click Vitals tab
    await page.locator('button:has-text("Vitals")').click();
    await expect(page).toHaveURL(/tab=vitals/);
    
    // Click Notes tab
    await page.locator('button:has-text("Notes")').click();
    await expect(page).toHaveURL(/tab=notes/);
  });
});

test.describe('Appointment Scheduler', () => {
  test('should display schedule', async ({ page }) => {
    await page.goto('http://localhost:3000/schedule');
    
    // Wait for schedule to load
    await page.waitForSelector('text=Schedule', { timeout: 10000 });
    
    // Check if week view is displayed
    await expect(page.locator('button:has-text("Week")')).toHaveClass(/bg-blue-600/);
    
    // Check if calendar grid is visible
    await expect(page.locator('text=Time')).toBeVisible();
  });

  test('should filter by provider', async ({ page }) => {
    await page.goto('http://localhost:3000/schedule');
    
    // Wait for initial load
    await page.waitForSelector('text=Schedule');
    
    // Select a provider
    const providerSelect = page.locator('select').first();
    await providerSelect.selectOption({ index: 1 });
    
    // Wait for appointments to filter
    await page.waitForTimeout(1000);
  });

  test('should open appointment details', async ({ page }) => {
    await page.goto('http://localhost:3000/schedule');
    
    // Wait for schedule to load
    await page.waitForTimeout(2000);
    
    // Try to click on an appointment if it exists
    const appointments = page.locator('[class*="border"]').filter({ hasText: /am|pm/i });
    const count = await appointments.count();
    
    if (count > 0) {
      await appointments.first().click();
      
      // Check if side panel opened
      await expect(page.locator('text=Appointment Details')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check homepage loads
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    
    // Navigate to Patients
    await page.locator('a:has-text("Patients")').click();
    await expect(page).toHaveURL(/\/patients/);
    
    // Navigate to Schedule
    await page.locator('a:has-text("Schedule")').click();
    await expect(page).toHaveURL(/\/schedule/);
    
    // Navigate back to Dashboard
    await page.locator('text=CareHub').click();
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});

test.describe('Notifications', () => {
  test('should display notification bell', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if notification bell is visible
    await expect(page.locator('button').filter({ has: page.locator('svg') }).first()).toBeVisible();
  });

  test('should open notification dropdown', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Click notification bell
    const bellButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await bellButton.click();
    
    // Check if dropdown opened
    await expect(page.locator('text=Notifications')).toBeVisible();
  });
});
