#include <stdio.h>

struct Employee
{
    int id;
    char name[30];
    float salary;
};

int main()
{
    FILE *fp;
    struct Employee e;
    int n, i, search;

    fp = fopen("employee.dat", "wb+");

    printf("Enter number of employees: ");
    scanf("%d", &n);

    for(i = 0; i < n; i++)
    {
        printf("\nEnter Employee ID: ");
        scanf("%d", &e.id);

        printf("Enter Employee Name: ");
        scanf("%s", e.name);

        printf("Enter Salary: ");
        scanf("%f", &e.salary);

        fwrite(&e, sizeof(e), 1, fp);
    }

    printf("\nEnter Employee ID to search: ");
    scanf("%d", &search);

    fseek(fp, (search - 1) * sizeof(e), SEEK_SET);

    fread(&e, sizeof(e), 1, fp);

    printf("\nEmployee Details\n");
    printf("----------------------\n");
    printf("ID     : %d\n", e.id);
    printf("Name   : %s\n", e.name);
    printf("Salary : %.2f\n", e.salary);

    fclose(fp);

    return 0;
}