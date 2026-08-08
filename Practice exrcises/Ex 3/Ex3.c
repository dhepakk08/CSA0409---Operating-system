#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main()
{
    pid_t pid = fork();

    if(pid == 0)
    {
        execl("/bin/ls","ls","-l",NULL);
    }
    else
    {
        wait(NULL);
        printf("Parent Finished\n");
    }

    return 0;
}