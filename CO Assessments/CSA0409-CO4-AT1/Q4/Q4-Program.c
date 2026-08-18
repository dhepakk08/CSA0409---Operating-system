#include <stdio.h>
#include <stdlib.h>

void sort(int a[], int n)
{
    int i, j, temp;

    for (i = 0; i < n - 1; i++)
    {
        for (j = i + 1; j < n; j++)
        {
            if (a[i] > a[j])
            {
                temp = a[i];
                a[i] = a[j];
                a[j] = temp;
            }
        }
    }
}

void cscan(int request[], int n, int head, int diskSize, int direction)
{
    int a[100], i, current = head;
    int movement = 0;

    for (i = 0; i < n; i++)
        a[i] = request[i];

    sort(a, n);

    printf("\nC-SCAN Seek Sequence: %d ", head);

    if (direction == 1)  /* Right */
    {
        for (i = 0; i < n; i++)
        {
            if (a[i] >= head)
            {
                movement += abs(current - a[i]);
                current = a[i];
                printf("-> %d ", current);
            }
        }

        movement += abs(current - (diskSize - 1));
        current = diskSize - 1;
        printf("-> %d ", current);

        movement += diskSize - 1;
        current = 0;
        printf("-> %d ", current);

        for (i = 0; i < n; i++)
        {
            if (a[i] < head)
            {
                movement += abs(current - a[i]);
                current = a[i];
                printf("-> %d ", current);
            }
        }
    }
    else  /* Left */
    {
        for (i = n - 1; i >= 0; i--)
        {
            if (a[i] <= head)
            {
                movement += abs(current - a[i]);
                current = a[i];
                printf("-> %d ", current);
            }
        }

        movement += current;
        current = 0;
        printf("-> %d ", current);

        movement += diskSize - 1;
        current = diskSize - 1;
        printf("-> %d ", current);

        for (i = n - 1; i >= 0; i--)
        {
            if (a[i] > head)
            {
                movement += abs(current - a[i]);
                current = a[i];
                printf("-> %d ", current);
            }
        }
    }

    printf("\nC-SCAN Total Head Movement = %d\n", movement);
}

void look(int request[], int n, int head, int direction)
{
    int a[100], i, current = head;
    int movement = 0;

    for (i = 0; i < n; i++)
        a[i] = request[i];

    sort(a, n);

    printf("\nLOOK Seek Sequence: %d ", head);

    if (direction == 1)  /* Right */
    {
        for (i = 0; i < n; i++)
        {
            if (a[i] >= head)
            {
                movement += abs(current - a[i]);
                current = a[i];
                printf("-> %d ", current);
            }
        }

        for (i = n - 1; i >= 0; i--)
        {
            if (a[i] < head)
            {
                movement += abs(current - a[i]);
                current = a[i];
                printf("-> %d ", current);
            }
        }
    }
    else  /* Left */
    {
        for (i = n - 1; i >= 0; i--)
        {
            if (a[i] <= head)
            {
                movement += abs(current - a[i]);
                current = a[i];
                printf("-> %d ", current);
            }
        }

        for (i = 0; i < n; i++)
        {
            if (a[i] > head)
            {
                movement += abs(current - a[i]);
                current = a[i];
                printf("-> %d ", current);
            }
        }
    }

    printf("\nLOOK Total Head Movement = %d\n", movement);
}

int main()
{
    int request[100];
    int n, head, diskSize, direction;
    int i;

    printf("Enter number of requests: ");
    scanf("%d", &n);

    printf("Enter request queue:\n");

    for (i = 0; i < n; i++)
        scanf("%d", &request[i]);

    printf("Enter initial head position: ");
    scanf("%d", &head);

    printf("Enter disk size: ");
    scanf("%d", &diskSize);

    printf("Enter direction (1 = Right, 0 = Left): ");
    scanf("%d", &direction);

    cscan(request, n, head, diskSize, direction);
    look(request, n, head, direction);

    return 0;
}