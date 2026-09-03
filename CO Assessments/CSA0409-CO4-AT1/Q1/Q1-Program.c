#include <stdio.h>

int main()
{
    int disk[100], n, fileSize, method;
    int i, j, start, count, indexBlock;

    printf("Enter total number of disk blocks: ");
    scanf("%d", &n);

    for (i = 0; i < n; i++)
        disk[i] = 0;   // 0 = free, 1 = allocated

    printf("Enter file size (number of blocks): ");
    scanf("%d", &fileSize);

    printf("\n1. Contiguous\n");
    printf("2. Linked\n");
    printf("3. Indexed\n");
    printf("Enter allocation method: ");
    scanf("%d", &method);

    if (fileSize > n)
    {
        printf("Error: File size is larger than disk size.\n");
        return 0;
    }

    /* CONTIGUOUS */
    if (method == 1)
    {
        count = 0;
        start = -1;

        for (i = 0; i < n; i++)
        {
            if (disk[i] == 0)
                count++;
            else
                count = 0;

            if (count == fileSize)
            {
                start = i - fileSize + 1;
                break;
            }
        }

        if (start == -1)
        {
            printf("Error: Insufficient contiguous space.\n");
        }
        else
        {
            printf("Allocated blocks: ");

            for (i = start; i < start + fileSize; i++)
            {
                disk[i] = 1;
                printf("%d ", i);
            }

            printf("\n");
        }
    }

    /* LINKED */
    else if (method == 2)
    {
        count = 0;

        printf("Allocated blocks: ");

        for (i = 0; i < n && count < fileSize; i++)
        {
            if (disk[i] == 0)
            {
                disk[i] = 1;
                printf("%d ", i);
                count++;
            }
        }

        if (count < fileSize)
            printf("\nError: Not enough free blocks.\n");
        else
            printf("\n");
    }

    /* INDEXED */
    else if (method == 3)
    {
        if (fileSize + 1 > n)
        {
            printf("Error: Not enough blocks for index block and data.\n");
            return 0;
        }

        /* Find index block */
        indexBlock = -1;

        for (i = 0; i < n; i++)
        {
            if (disk[i] == 0)
            {
                indexBlock = i;
                disk[i] = 1;
                break;
            }
        }

        count = 0;

        printf("Index block: %d\n", indexBlock);
        printf("Allocated data blocks: ");

        for (i = 0; i < n && count < fileSize; i++)
        {
            if (disk[i] == 0)
            {
                disk[i] = 1;
                printf("%d ", i);
                count++;
            }
        }

        if (count < fileSize)
            printf("\nError: Not enough free blocks.\n");
        else
            printf("\n");
    }

    else
    {
        printf("Invalid allocation method.\n");
    }

    return 0;
}