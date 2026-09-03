#include <stdio.h>

int main()
{
    int block[10], process[10];
    int nb, np, i, j, best;

    printf("Enter number of memory blocks: ");
    scanf("%d", &nb);

    printf("Enter block sizes:\n");
    for(i = 0; i < nb; i++)
        scanf("%d", &block[i]);

    printf("Enter number of processes: ");
    scanf("%d", &np);

    printf("Enter process sizes:\n");
    for(i = 0; i < np; i++)
        scanf("%d", &process[i]);


    printf("\n--- BEST FIT MEMORY ALLOCATION ---\n");

    for(i = 0; i < np; i++)
    {
        best = -1;

        // Find smallest suitable block
        for(j = 0; j < nb; j++)
        {
            if(block[j] >= process[i])
            {
                if(best == -1 || block[j] < block[best])
                    best = j;
            }
        }


        if(best != -1)
        {
            printf("\n+---------------------------+\n");
            printf("| Memory Block : %-10d |\n", best + 1);
            printf("| Process      : P%-9d |\n", i + 1);
            printf("| Size         : %-9d |\n", process[i]);
            printf("+---------------------------+\n");

            block[best] -= process[i];
        }
        else
        {
            printf("\n+---------------------------+\n");
            printf("| Process P%d Not Allocated  |\n", i + 1);
            printf("+---------------------------+\n");
        }
    }

    return 0;
}