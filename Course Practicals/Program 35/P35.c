#include <stdio.h>

int main()
{
    int index[20], n, i, indexBlock;

    printf("Enter index block: ");
    scanf("%d", &indexBlock);

    printf("Enter number of blocks: ");
    scanf("%d", &n);

    printf("Enter block numbers:\n");

    for (i = 0; i < n; i++)
        scanf("%d", &index[i]);

    printf("Index Block: %d\n", indexBlock);
    printf("File blocks: ");

    for (i = 0; i < n; i++)
        printf("%d ", index[i]);

    return 0;
}