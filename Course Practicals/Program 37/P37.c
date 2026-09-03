#include <stdio.h>
#include <stdlib.h>

int main()
{
    int req[20], n, head, i, movement = 0;

    printf("Enter number of requests: ");
    scanf("%d", &n);

    printf("Enter requests:\n");
    for (i = 0; i < n; i++)
        scanf("%d", &req[i]);

    printf("Enter initial head position: ");
    scanf("%d", &head);

    printf("Order: %d ", head);

    for (i = 0; i < n; i++)
    {
        movement += abs(head - req[i]);
        head = req[i];
        printf("-> %d ", head);
    }

    printf("\nTotal head movement = %d", movement);

    return 0;
}