#include <stdio.h>

int main()
{
    int bitmap[100];
    int n, i, required;
    int count = 0;
    int block;

    printf("Enter total number of disk blocks: ");
    scanf("%d", &n);

    printf("Enter bitmap (0 = free, 1 = allocated):\n");

    for (i = 0; i < n; i++)
        scanf("%d", &bitmap[i]);

    printf("\nEnter number of blocks to allocate: ");
    scanf("%d", &required);

    /* Allocation */
    printf("Allocated blocks: ");

    for (i = 0; i < n && count < required; i++)
    {
        if (bitmap[i] == 0)
        {
            bitmap[i] = 1;
            printf("%d ", i);
            count++;
        }
    }

    if (count < required)
    {
        printf("\nError: Not enough free blocks.\n");

        /* Undo allocation */
        for (i = 0; i < n; i++)
        {
            if (bitmap[i] == 1)
                bitmap[i] = 1;
        }
    }
    else
    {
        printf("\n");
    }

    printf("Bitmap after allocation:\n");

    for (i = 0; i < n; i++)
        printf("%d ", bitmap[i]);

    /* Deallocation */
    printf("\n\nEnter block number to deallocate (-1 to stop): ");

    while (1)
    {
        scanf("%d", &block);

        if (block == -1)
            break;

        if (block >= 0 && block < n)
        {
            if (bitmap[block] == 1)
            {
                bitmap[block] = 0;
                printf("Block %d deallocated.\n", block);
            }
            else
            {
                printf("Block %d is already free.\n", block);
            }
        }
        else
        {
            printf("Invalid block number.\n");
        }

        printf("Enter another block (-1 to stop): ");
    }

    printf("\nFinal bitmap:\n");

    for (i = 0; i < n; i++)
        printf("%d ", bitmap[i]);

    return 0;
}