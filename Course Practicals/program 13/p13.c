#include <stdio.h>

int main()
{
    int nb, np, i, j, choice;
    int block[20], process[20], temp[20];
    int index;

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

    printf("\n1. First Fit\n");
    printf("2. Best Fit\n");
    printf("3. Worst Fit\n");
    printf("Enter your choice: ");
    scanf("%d", &choice);

    // Copy original block sizes
    for(i = 0; i < nb; i++)
        temp[i] = block[i];

    printf("\nProcess\tSize\tBlock\n");

    for(i = 0; i < np; i++)
    {
        index = -1;

        if(choice == 1)        // First Fit
        {
            for(j = 0; j < nb; j++)
            {
                if(temp[j] >= process[i])
                {
                    index = j;
                    break;
                }
            }
        }
        else if(choice == 2)   // Best Fit
        {
            for(j = 0; j < nb; j++)
            {
                if(temp[j] >= process[i])
                {
                    if(index == -1 || temp[j] < temp[index])
                        index = j;
                }
            }
        }
        else if(choice == 3)   // Worst Fit
        {
            for(j = 0; j < nb; j++)
            {
                if(temp[j] >= process[i])
                {
                    if(index == -1 || temp[j] > temp[index])
                        index = j;
                }
            }
        }

        if(index != -1)
        {
            printf("P%d\t%d\t%d\n", i + 1, process[i], index + 1);
            temp[index] -= process[i];
        }
        else
        {
            printf("P%d\t%d\tNot Allocated\n", i + 1, process[i]);
        }
    }

    return 0;
}