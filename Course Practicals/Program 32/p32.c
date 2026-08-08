#include <stdio.h>

int main()
{
    int pages[50], frames[10], time[10];
    int n, f, i, j, counter = 0;
    int fault = 0, found, pos;

    printf("Enter number of pages: ");
    scanf("%d", &n);

    printf("Enter page reference string:\n");
    for(i = 0; i < n; i++)
        scanf("%d", &pages[i]);

    printf("Enter number of frames: ");
    scanf("%d", &f);

    for(i = 0; i < f; i++)
    {
        frames[i] = -1;
        time[i] = 0;
    }

    for(i = 0; i < n; i++)
    {
        found = 0;
        counter++;

        for(j = 0; j < f; j++)
        {
            if(frames[j] == pages[i])
            {
                found = 1;
                time[j] = counter;
                break;
            }
        }

        if(found == 0)
        {
            pos = 0;

            for(j = 1; j < f; j++)
            {
                if(time[j] < time[pos])
                    pos = j;
            }

            frames[pos] = pages[i];
            time[pos] = counter;
            fault++;
        }

        printf("\nPage %d: ", pages[i]);

        for(j = 0; j < f; j++)
        {
            if(frames[j] == -1)
                printf("- ");
            else
                printf("%d ", frames[j]);
        }
    }

    printf("\n\nTotal Page Faults = %d\n", fault);

    return 0;
}