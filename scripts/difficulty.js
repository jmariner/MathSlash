var DIFFICULTY_DATA = {
    1: {
        values: [
            {
                operations: "+",
                limits: [1, 50]
            }
        ]
    },
    2: {
        values: [
            {
                operations: "+-",
                limits: [1, 100]
            }
        ],
        options: {
            subtractToNegative: false
        }
    },
    3: {
        values:[
            {
                operations: "*",
                limits: [1, 12]
            }
        ],
        options: {
            inherit: true,
            subtractToNegative: true
        }
    },
    4: {
        values: [
            {
                operation: "/"
            }
        ]
    }
}