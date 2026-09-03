#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/wait.h>

int main()
{
    pid_t pid = fork();

    if(pid == 0)
    {
        printf("Child Process Terminated\n");
        exit(0);
    }
    else
    {
        wait(NULL);
        printf("Parent: Child Completed\n");
    }

    return 0;
}