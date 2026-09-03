#include <stdio.h>

int main()
{
    int n, bt[10], rem[10];
    int tq, i;

    printf("Enter number of processes: ");
    scanf("%d", &n);

    for(i = 0; i < n; i++)
    {
        printf("Burst Time of P%d: ", i + 1);
        scanf("%d", &bt[i]);
        rem[i] = bt[i];
    }

    printf("Enter Time Quantum: ");
    scanf("%d", &tq);

    printf("\nExecution Order:\n");

    while(1)
    {
        int done = 1;

        for(i = 0; i < n; i++)
        {
            if(rem[i] > 0)
            {
                done = 0;

                if(rem[i] > tq)
                {
                    printf("P%d ", i + 1);
                    rem[i] -= tq;
                }
                else
                {
                    printf("P%d ", i + 1);
                    rem[i] = 0;
                }
            }
        }

        if(done)
            break;
    }

    return 0;
}