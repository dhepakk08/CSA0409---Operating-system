#include <stdio.h>

int main()
{
    int start, n, i;

    printf("Enter starting block: ");
    scanf("%d", &start);

    printf("Enter number of blocks: ");
    scanf("%d", &n);

    printf("Allocated blocks: ");

    for (i = 0; i < n; i++)
        printf("%d ", start + i);

    return 0;
}