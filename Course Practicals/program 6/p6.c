#include <stdio.h>

int main()
{
    int n, bt[10], pr[10], done[10] = {0};
    int i, j, min, pos;

    printf("Enter number of processes: ");
    scanf("%d", &n);

    for(i = 0; i < n; i++)
    {
        printf("Burst Time P%d: ", i + 1);
        scanf("%d", &bt[i]);

        printf("Priority P%d: ", i + 1);
        scanf("%d", &pr[i]);
    }

    printf("\nExecution Order:\n");

    for(i = 0; i < n; i++)
    {
        min = 999;
        for(j = 0; j < n; j++)
        {
            if(done[j] == 0 && pr[j] < min)
            {
                min = pr[j];
                pos = j;
            }
        }

        printf("P%d ", pos + 1);
        done[pos] = 1;
    }

    return 0;
}