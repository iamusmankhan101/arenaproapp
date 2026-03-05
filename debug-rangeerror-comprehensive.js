/**
 * Comprehensive RangeError debugging script
 * This will help identify exactly where the Date value out of bounds error is occurring
 */

// Override the Date constructor to catch invalid dates
const originalDate = Date;
const dateCallStack = [];

// Create a wrapper for Date constructor that logs all calls
function DebugDate(...args) {
  const stack = new Error().stack;
  const caller = stack.split('\n')[2]?.trim() || 'Unknown caller';
  
  console.log('🔍 Date constructor called with args:', args);
  console.log('🔍 Called from:', caller);
  
  try {
    const date = new originalDate(...args);
    
    // Check if the created date is invalid
    if (isNaN(date.getTime())) {
      console.error('❌ INVALID DATE CREATED:', {
        args: args,
        result: date.toString(),
        caller: caller,
        stack: stack
      });
      
      // Store the call info for analysis
      dateCallStack.push({
        args: args,
        caller: caller,
        timestamp: new originalDate().toISOString(),
        isValid: false
      });
      
      // Still return the invalid date to maintain compatibility
      return date;
    } else {
      console.log('✅ Valid date created:', date.toISOString());
      dateCallStack.push({
        args: args,
        caller: caller,
        timestamp: new originalDate().toISOString(),
        isValid: true
      });
      return date;
    }
  } catch (error) {
    console.error('❌ DATE CONSTRUCTOR ERROR:', {
      error: error.message,
      args: args,
      caller: caller,
      stack: stack
    });
    
    dateCallStack.push({
      args: args,
      caller: caller,
      timestamp: new originalDate().toISOString(),
      error: error.message,
      isValid: false
    });
    
    throw error;
  }
}

// Copy all static methods from original Date
Object.setPrototypeOf(DebugDate, originalDate);
Object.getOwnPropertyNames(originalDate).forEach(name => {
  if (typeof originalDate[name] === 'function') {
    DebugDate[name] = originalDate[name];
  }
});

// Replace global Date with our debug version
global.Date = DebugDate;

console.log('🚀 Date debugging enabled. All Date constructor calls will be logged.');
console.log('📊 To see the call stack summary, run: console.log(dateCallStack);');

// Test some common problematic date patterns
console.log('\n🧪 Testing common problematic date patterns:');

const testCases = [
  // Valid cases
  { name: 'Current date', args: [] },
  { name: 'Valid ISO string', args: ['2026-02-04T10:00:00.000Z'] },
  { name: 'Valid date string', args: ['2026-02-04'] },
  { name: 'Valid timestamp', args: [Date.now()] },
  
  // Potentially problematic cases
  { name: 'Invalid string', args: ['invalid-date'] },
  { name: 'Empty string', args: [''] },
  { name: 'Null', args: [null] },
  { name: 'Undefined', args: [undefined] },
  { name: 'NaN', args: [NaN] },
  { name: 'Very large number', args: [Number.MAX_SAFE_INTEGER] },
  { name: 'Negative number', args: [-1] },
  { name: 'Invalid ISO format', args: ['2026-02-04T25:00:00.000Z'] },
  { name: 'Malformed date', args: ['2026-13-45'] },
];

testCases.forEach((testCase, index) => {
  console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);
  try {
    const date = new Date(...testCase.args);
    console.log(`   Result: ${date.toString()}`);
    console.log(`   Valid: ${!isNaN(date.getTime())}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
});

// Function to analyze the call stack
function analyzeCallStack() {
  console.log('\n📊 Date Call Stack Analysis:');
  console.log('=' .repeat(50));
  
  const invalidCalls = dateCallStack.filter(call => !call.isValid || call.error);
  const validCalls = dateCallStack.filter(call => call.isValid && !call.error);
  
  console.log(`Total Date constructor calls: ${dateCallStack.length}`);
  console.log(`Valid calls: ${validCalls.length}`);
  console.log(`Invalid calls: ${invalidCalls.length}`);
  
  if (invalidCalls.length > 0) {
    console.log('\n❌ Invalid Date calls:');
    invalidCalls.forEach((call, index) => {
      console.log(`${index + 1}. Args: ${JSON.stringify(call.args)}`);
      console.log(`   Caller: ${call.caller}`);
      console.log(`   Time: ${call.timestamp}`);
      if (call.error) {
        console.log(`   Error: ${call.error}`);
      }
      console.log('');
    });
  }
  
  // Group by caller to see patterns
  const callerGroups = {};
  dateCallStack.forEach(call => {
    const caller = call.caller || 'Unknown';
    if (!callerGroups[caller]) {
      callerGroups[caller] = { valid: 0, invalid: 0, calls: [] };
    }
    if (call.isValid && !call.error) {
      callerGroups[caller].valid++;
    } else {
      callerGroups[caller].invalid++;
    }
    callerGroups[caller].calls.push(call);
  });
  
  console.log('\n📈 Calls by location:');
  Object.entries(callerGroups).forEach(([caller, stats]) => {
    console.log(`${caller}: ${stats.valid} valid, ${stats.invalid} invalid`);
  });
}

// Export the analysis function
global.analyzeCallStack = analyzeCallStack;
global.dateCallStack = dateCallStack;

console.log('\n💡 Usage:');
console.log('- Run your app normally');
console.log('- When you get the RangeError, run: analyzeCallStack()');
console.log('- Check the console for detailed information about invalid Date calls');

// Also override toISOString to catch calls on invalid dates
const originalToISOString = originalDate.prototype.toISOString;
originalDate.prototype.toISOString = function() {
  if (isNaN(this.getTime())) {
    const stack = new Error().stack;
    const caller = stack.split('\n')[2]?.trim() || 'Unknown caller';
    
    console.error('❌ toISOString() called on invalid date:', {
      date: this.toString(),
      caller: caller,
      stack: stack
    });
    
    // This will throw the RangeError
    throw new RangeError('Date value out of bounds');
  }
  
  return originalToISOString.call(this);
};

console.log('🔍 Also monitoring toISOString() calls on invalid dates');