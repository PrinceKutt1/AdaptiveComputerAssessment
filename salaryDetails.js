//basic salary does not include deductions
//net pay is what an employee takes home after all the required deductions(tax and pension contribution).
//gross salary includes base salary and allowances

const calculatePension = ( salary , factors , forward ) => {

    const relative = true;

    if(!forward) factors.reverse();

    let salary0 = salary;

    for( const factor of factors ){
       
        const value = forward ? (( relative ? salary0 : salary ) * ( factor / 100 ) ) :
        
        ( ( ( relative ? salary0 : salary ) * 100 ) / 100 - factor );

        salary0 = forward ? salary0 - value : salary0 + value;
    }

    return salary0;
}

//unTaxedSalaryWithAllowances = baseSalary
const getEmployeePensionContribution = baseSalary => baseSalary - calculatePension( baseSalary , [ 0 , 5.5 , 5] , true )

const getEmployerPensionContribution = baseSalary => baseSalary - calculatePension( baseSalary , [ 13 , 0 , 5] , true )

const unTaxSalary= taxedSalary =>{

    let getUnTaxedSalary = (salaryAfterTax , rate)=>{
        return ( 100 * salaryAfterTax ) / ( 100 - rate );
    };

    const taxFigures = [
        { partRange:319 , rate : 0 , tax:0 , ccIncome:319 , cTax:0 },
        { partRange:100 , rate : 5 , tax:5 , ccIncome:419 , cTax:5 },
        { partRange:120 , rate : 10 , tax:12 , ccIncome:539 , cTax:17 },
        { partRange:3000 , rate : 17.5 , tax:525 , ccIncome:3539 , cTax:542 },
        { partRange:16461 , rate : 25 , tax:4115.25 , ccIncome:20000 , cTax:4657.25 },
        { partRange:Number.POSITIVE_INFINITY , rate : 30 , tax:null , ccIncome:null , cTax:null }
    ];

    let targetIndex ;
    let lastTaxFigure = null;
    for( let i = 0 ; i < taxFigures.length - 1 ; i++ ){

        const taxFigure = taxFigures[i];
        
        let ccTaxedIncome = taxFigure.ccIncome - taxFigure.cTax;

        if( taxedSalary > ( lastTaxFigure ? ( lastTaxFigure.ccIncome - lastTaxFigure.cTax ) : -1 ) && taxedSalary <= ccTaxedIncome ){
            targetIndex = i;
            break;
        }

        lastTaxFigure = taxFigure;
    }

    targetIndex = targetIndex == undefined ? taxFigures.length - 1 : targetIndex;

    const isLast = targetIndex == taxFigures.length - 1;

    const unTaxedSalary = 
    
    (targetIndex < 1 ? 0 : taxFigures[ targetIndex - 1 ].ccIncome ) 
    
    + getUnTaxedSalary( taxedSalary - ( targetIndex < 1 ? 0 : ( taxFigures[ targetIndex - 1 ].ccIncome - taxFigures[ targetIndex - 1 ].cTax ) ), taxFigures[targetIndex].rate );

    return unTaxedSalary;
};


const getSalaryInfoByNetSalary = (netSalary , total_allowances ) => {

    let unTaxedSalaryWithAllowances = unTaxSalary( netSalary );

    let basicSalaryWithoutPensions = unTaxedSalaryWithAllowances - total_allowances;

    let basicSalaryWithPension = getBasicSalaryWithPension( basicSalaryWithoutPensions );

    let basicSalary = basicSalaryWithPension;

    // will be computed from netSalary
    let employeePensionContribution = getEmployeePensionContribution( basicSalary );
    let employerPensionContribution = getEmployerPensionContribution( basicSalary );
    let totalPayeTax = unTaxedSalaryWithAllowances - netSalary;

/*
    let basic_salary = netSalary + totalTax + employeePensionContribution;
*/
    let grossSalary = basicSalary + total_allowances;
    
    return {
        grossSalary,
        basicSalary,
        totalPayeTax,
        employeePensionContribution,
        employerPensionContribution
    };
};

function getBasicSalaryWithPension( basicSalaryWithoutPensions ){
    return calculatePension( basicSalaryWithoutPensions , [ 0 , 5.5 , 5] , false );
}

console.log( getSalaryInfoByNetSalary( 15396.95 , 400 ) );
