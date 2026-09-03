#include <stdio.h>
#include <stdlib.h>

int main()
{
    int a[20], n, head, disk, i, j, temp;
    int movement = 0;

    printf("Enter number of requests: ");
    scanf("%d", &n);

    printf("Enter requests:\n");
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);

    printf("Enter head position: ");
    scanf("%d", &head);

    printf("Enter disk size: ");
    scanf("%d", &disk);

    /* Sort */
    for (i = 0; i < n; i++)
        for (j = i + 1; j < n; j++)
            if (a[i] > a[j])
            {
                temp = a[i];
                a[i] = a[j];
                a[j] = temp;
            }

    printf("SCAN Order: %d ", head);

    /* Move right */
    for (i = 0; i < n; i++)
    {
        if (a[i] >= head)
        {
            movement += abs(head - a[i]);
            head = a[i];
            printf("-> %d ", head);
        }
    }

    /* Go to end */
    movement += abs(head - (disk - 1));
    head = disk - 1;
    printf("-> %d ", head);

    /* Move left */
    for (i = n - 1; i >= 0; i--)
    {
        if (a[i] < head)
        {
            movement += abs(head - a[i]);
            head = a[i];
            printf("-> %d ", head);
        }
    }

    printf("\nTotal head movement = %d", movement);

    return 0;
}