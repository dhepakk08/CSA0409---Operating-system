#include <stdio.h>

int main()
{
    int n, r, i, j, k;
    int alloc[10][10], max[10][10], need[10][10], avail[10];
    int finish[10] = {0}, safe[10];

    printf("Enter number of processes: ");
    scanf("%d", &n);

    printf("Enter number of resources: ");
    scanf("%d", &r);

    printf("Enter Allocation Matrix:\n");
    for(i=0;i<n;i++)
        for(j=0;j<r;j++)
            scanf("%d",&alloc[i][j]);

    printf("Enter Maximum Matrix:\n");
    for(i=0;i<n;i++)
        for(j=0;j<r;j++)
            scanf("%d",&max[i][j]);

    printf("Enter Available Resources:\n");
    for(i=0;i<r;i++)
        scanf("%d",&avail[i]);

    for(i=0;i<n;i++)
        for(j=0;j<r;j++)
            need[i][j]=max[i][j]-alloc[i][j];

    int count=0;

    while(count<n)
    {
        int found=0;

        for(i=0;i<n;i++)
        {
            if(finish[i]==0)
            {
                int flag=0;

                for(j=0;j<r;j++)
                {
                    if(need[i][j]>avail[j])
                        flag=1;
                }

                if(flag==0)
                {
                    for(k=0;k<r;k++)
                        avail[k]+=alloc[i][k];

                    safe[count++]=i;
                    finish[i]=1;
                    found=1;
                }
            }
        }

        if(found==0)
        {
            printf("System is unsafe");
            return 0;
        }
    }

    printf("System is safe\nSafe sequence: ");

    for(i=0;i<n;i++)
        printf("P%d ",safe[i]);

    return 0;
}