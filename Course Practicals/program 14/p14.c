#include <stdio.h>

int main()
{
    int n, i;
    char file[20][30];

    printf("Enter number of files: ");
    scanf("%d", &n);

    for(i = 0; i < n; i++)
    {
        printf("Enter file %d name: ", i + 1);
        scanf("%s", file[i]);
    }

    printf("\nFiles in Single Level Directory:\n");

    for(i = 0; i < n; i++)
    {
        printf("%s\n", file[i]);
    }

    return 0;
}