#include <stdio.h>

int main()
{
    int block[10], process[10];
    int nb, np, i, j, worst;

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


    printf("\n--- WORST FIT MEMORY ALLOCATION ---\n");

    for(i = 0; i < np; i++)
    {
        worst = -1;

        // Find largest block
        for(j = 0; j < nb; j++)
        {
            if(block[j] >= process[i])
            {
                if(worst == -1 || block[j] > block[worst])
                    worst = j;
            }
        }


        if(worst != -1)
        {
            printf("\n+---------------------------+\n");
            printf("| Memory Block : %-10d |\n", worst + 1);
            printf("| Process      : P%-9d |\n", i + 1);
            printf("| Size         : %-9d |\n", process[i]);
            printf("+---------------------------+\n");

            block[worst] -= process[i];
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