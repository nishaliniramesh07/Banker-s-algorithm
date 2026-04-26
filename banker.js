function getSteps(n, m, available, max, allocation) {
    let need = [];
    let steps = [];

    // 🔥 Calculate Need matrix
    for (let i = 0; i < n; i++) {
        need[i] = [];
        for (let j = 0; j < m; j++) {
            need[i][j] = max[i][j] - allocation[i][j];
        }
    }

    let finish = Array(n).fill(false);
    let work = [...available];
    let sequence = [];

    while (sequence.length < n) {
        let found = false;

        for (let i = 0; i < n; i++) {
            if (!finish[i]) {

                let canExecute = true;
                let failedIndex = -1;

                for (let j = 0; j < m; j++) {
                    if (need[i][j] > work[j]) {
                        canExecute = false;
                        failedIndex = j;
                        break;
                    }
                }

                if (canExecute) {

                    // ✅ SAFE STEP
                    steps.push({
                        process: i,
                        need: [...need[i]],
                        available: [...work],
                        status: "safe",
                        reason: "Need ≤ Available"
                    });

                    // Release resources
                    for (let j = 0; j < m; j++) {
                        work[j] += allocation[i][j];
                    }

                    finish[i] = true;
                    sequence.push("P" + i);
                    found = true;

                } else {
                    // ❌ STORE FAILURE INFO (NEW 🔥)
                    steps.push({
                        process: i,
                        need: [...need[i]],
                        available: [...work],
                        status: "blocked",
                        failedResource: failedIndex,
                        reason: `Need[${failedIndex}] > Available[${failedIndex}]`
                    });
                }
            }
        }

        // ❌ Unsafe case
        if (!found) {
            return {
                safe: false,
                steps,
                deadlock: true
            };
        }
    }

    return {
        safe: true,
        steps,
        sequence
    };
}