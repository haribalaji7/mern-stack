function showmymessage() {
    var a = 10;
    var b = 20;
    console.log(a + b);
}

let str = "hello";
let str1 = 'hello world';
console.log(typeof str);
console.log(typeof str1);

// Age validation function
function isValid(age) {
    if (age >= 18) {
        console.log(" You are eligible");
        return true;
    } else {
        console.log(" You are not eligible");
        return false;
    }
}

// Testing the function
isValid(20);
isValid(15);

const person = {
    name: "hari",
    age: 19,
    isStudent: false,
    college: "sri eswar college of engineering",
    address: {
        city: "chennai",
        state: "tamilnadu"
    },
    contactNumbers: [1234567890, 9876543210]
};

console.log(person);

const numbers = [1, 2, 3, 4];

// pop removes the last element
numbers.pop();
console.log(numbers);

// shift removes the first element
numbers.shift();
console.log(numbers);
for (let i = 0; i < numbers.length; i++) {
    console.log(numbers[i]);
}

function add(name) {
    console.log("Hello " + name);
}
add("hari");
add("suriya");

const multiply = (a, b) => {
    return a - b;
}
console.log(multiply(40, 34));
console.log("task 1");
setTimeout(() => {
    console.log("task 2");
}, 2000);
console.log("task 3");