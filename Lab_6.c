#include <stdio.h>
#include <limits.h>

int main()
{
    int n, i, completed = 0, time = 0;
    int bt[20], rt[20], pr[20], wt[20], tat[20];

    printf("Enter number of processes: ");
    scanf("%d", &n);

    for(i = 0; i < n; i++)
    {
        printf("\nProcess P%d\n", i + 1);

        printf("Burst Time: ");
        scanf("%d", &bt[i]);

        printf("Priority (Smaller number = Higher priority): ");
        scanf("%d", &pr[i]);

        rt[i] = bt[i];
    }

    while(completed < n)
    {
        int highest = -1;
        int minPriority = INT_MAX;

        for(i = 0; i < n; i++)
        {
            if(rt[i] > 0 && pr[i] < minPriority)
            {
                minPriority = pr[i];
                highest = i;
            }
        }

        rt[highest]--;
        time++;

        if(rt[highest] == 0)
        {
            completed++;

            tat[highest] = time;
            wt[highest] = tat[highest] - bt[highest];
        }
    }

    printf("\nProcess\tBT\tPriority\tWT\tTAT\n");

    for(i = 0; i < n; i++)
    {
        printf("P%d\t%d\t%d\t\t%d\t%d\n",
               i + 1, bt[i], pr[i], wt[i], tat[i]);
    }

    return 0;
}