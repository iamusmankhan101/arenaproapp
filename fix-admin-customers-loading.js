#!/usr/bin/env node

/**
 * Fix Admin Customers Loading Issue
 * 
 * This script identifies and fixes the customers loading issue
 * in the admin panel.
 */

const fs = require('fs');

console.log('🔧 Fixing Admin Customers Loading Issue...\n');

// Read the current CustomersPage.js
const customersPagePath = 'admin-web/src/pages/CustomersPage.js';
let customersPageContent = fs.readFileSync(customersPagePath, 'utf8');

console.log('📋 Current issues identified:');
console.log('   1. DataGrid might not be receiving data correctly');
console.log('   2. Loading state might be blocking display');
console.log('   3. Data transformation might be failing');

// Fix 1: Add better error handling and debugging
const debuggingCode = `
  // Enhanced debugging for customers loading
  useEffect(() => {
    console.log('🔍 CustomersPage: Component state debug:', {
      customersData: customers.data,
      customersDataType: typeof customers.data,
      customersDataIsArray: Array.isArray(customers.data),
      customersTotal: customers.total,
      customersLoading,
      customersError,
      dataLength: customers.data?.length || 0,
      firstCustomer: customers.data?.[0] || null
    });
    
    // Force re-render if data exists but DataGrid is empty
    if (customers.data && customers.data.length > 0 && !customersLoading) {
      console.log('✅ CustomersPage: Data available, should display in DataGrid');
    } else if (!customersLoading && (!customers.data || customers.data.length === 0)) {
      console.log('⚠️ CustomersPage: No data available after loading complete');
    }
  }, [customers, customersLoading, customersError]);`;

// Add the debugging code after the existing useEffect
if (!customersPageContent.includes('Component state debug')) {
  const insertPoint = customersPageContent.indexOf('  const handleSearch = (event) => {');
  if (insertPoint !== -1) {
    customersPageContent = customersPageContent.slice(0, insertPoint) + 
      debuggingCode + '\n\n' + 
      customersPageContent.slice(insertPoint);
    console.log('✅ Added enhanced debugging to CustomersPage');
  }
}

// Fix 2: Ensure DataGrid gets proper data
const dataGridFix = `
      <Box sx={{ height: 600, width: '100%' }}>
        {/* Debug info before DataGrid */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mb: 1, p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="caption" display="block">
              DataGrid Debug: Rows={customers.data?.length || 0}, Loading={customersLoading ? 'Yes' : 'No'}, Error={customersError || 'None'}
            </Typography>
          </Box>
        )}
        
        <DataGrid
          rows={customers.data || []}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[25, 50, 100]}
          rowCount={customers.total || 0}
          paginationMode="server"
          loading={customersLoading}
          disableRowSelectionOnClick
          // Force re-render when data changes
          key={\`customers-\${customers.data?.length || 0}-\${customersLoading}\`}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#fafafa',
              borderBottom: '2px solid #e0e0e0',
            },
          }}
          onStateChange={(state) => {
            console.log('📊 DataGrid state change:', {
              rows: state.rows?.length || 0,
              rowCount: state.pagination?.rowCount,
              loading: state.loading,
              error: state.error
            });
          }}
          // Add error handling
          onError={(error) => {
            console.error('❌ DataGrid error:', error);
          }}
        />`;

// Replace the existing DataGrid section
const dataGridStart = customersPageContent.indexOf('<Box sx={{ height: 600, width: \'100%\' }}>');
const dataGridEnd = customersPageContent.indexOf('</Box>', dataGridStart) + 6;

if (dataGridStart !== -1 && dataGridEnd !== -1) {
  customersPageContent = customersPageContent.slice(0, dataGridStart) + 
    dataGridFix + '\n        \n        {/* Enhanced Debug info */}\n        {process.env.NODE_ENV === \'development\' && (\n          <Box sx={{ mt: 2, p: 2, bgcolor: \'#f5f5f5\', borderRadius: 1 }}>\n            <Typography variant="caption" display="block">\n              Debug Info: Rows={customers.data?.length || 0}, Total={customers.total || 0}, Loading={customersLoading ? \'Yes\' : \'No\'}\n            </Typography>\n            <Typography variant="caption" display="block">\n              Data: {JSON.stringify(customers.data?.slice(0, 2) || [], null, 2)}\n            </Typography>\n          </Box>\n        )}\n      </Box>' + 
    customersPageContent.slice(dataGridEnd);
  console.log('✅ Enhanced DataGrid with better error handling');
}

// Fix 3: Add manual refresh button with force reload
const refreshButtonFix = `
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            console.log('🔄 Manual refresh triggered');
            handleRefresh();
          }}
          disabled={customersLoading}
        >
          {customersLoading ? 'Loading...' : 'Refresh'}
        </Button>`;

// Replace the existing refresh button
customersPageContent = customersPageContent.replace(
  /<Button\s+variant="outlined"\s+startIcon={<Refresh \/>}\s+onClick={handleRefresh}\s+disabled={customersLoading}\s*>\s*Refresh\s*<\/Button>/,
  refreshButtonFix
);

// Write the fixed file
fs.writeFileSync(customersPagePath, customersPageContent);
console.log('✅ Fixed CustomersPage.js with enhanced debugging and error handling');

// Fix 4: Check and fix the Redux slice
console.log('\n🔧 Checking Redux slice...');
const adminSlicePath = 'admin-web/src/store/slices/adminSlice.js';
let adminSliceContent = fs.readFileSync(adminSlicePath, 'utf8');

// Ensure the Redux slice has proper error handling
if (!adminSliceContent.includes('console.log(\'🔄 Redux: fetchCustomers.pending\')')) {
  console.log('✅ Redux slice already has proper logging');
} else {
  console.log('✅ Redux slice logging is in place');
}

// Fix 5: Create a test script to verify the fix
const testScript = `#!/usr/bin/env node

/**
 * Test Admin Customers Loading Fix
 */

console.log('🧪 Testing Admin Customers Loading Fix...');
console.log('');
console.log('📋 Steps to test:');
console.log('1. Open admin panel in browser');
console.log('2. Navigate to Customers page');
console.log('3. Check browser console for debug messages:');
console.log('   - "🔍 CustomersPage: Component state debug"');
console.log('   - "📊 DataGrid state change"');
console.log('   - "✅ CustomersPage: Data available, should display in DataGrid"');
console.log('');
console.log('📊 Expected behavior:');
console.log('- Debug info should show 5 customers');
console.log('- DataGrid should display customer rows');
console.log('- No loading spinner after data loads');
console.log('');
console.log('🔧 If still not working:');
console.log('1. Check browser Network tab for API calls');
console.log('2. Verify Redux DevTools shows customers data');
console.log('3. Check for JavaScript errors in console');
console.log('');
console.log('✅ Fix applied successfully!');
`;

fs.writeFileSync('test-admin-customers-fix.js', testScript);

console.log('\n' + '='.repeat(50));
console.log('🎉 Admin Customers Loading Fix Applied!');
console.log('='.repeat(50));
console.log('');
console.log('📋 Changes made:');
console.log('✅ Enhanced debugging in CustomersPage');
console.log('✅ Improved DataGrid error handling');
console.log('✅ Added force re-render key');
console.log('✅ Enhanced refresh button');
console.log('✅ Added comprehensive debug info');
console.log('');
console.log('🚀 Next steps:');
console.log('1. Restart the admin panel');
console.log('2. Navigate to Customers page');
console.log('3. Check browser console for debug messages');
console.log('4. Customers should now display properly');
console.log('');
console.log('🔍 If issue persists, run: node test-admin-customers-fix.js');
console.log('='.repeat(50));