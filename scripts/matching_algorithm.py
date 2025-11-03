#!/usr/bin/env python3
"""
AI Matching Algorithm for TalentMatch Platform
Matches job seekers with vacancies based on skills, experience, and preferences
"""

import json
import sys
from typing import List, Dict, Any
from dataclasses import dataclass
import re

@dataclass
class Candidate:
    id: int
    skills: List[str]
    experience_years: int
    education_level: str
    preferred_location: str
    remote_preference: str
    availability: str

@dataclass
class Vacancy:
    id: int
    title: str
    required_skills: List[str]
    experience_level: str
    location: str
    remote_option: str
    employment_type: str

def normalize_text(text: str) -> str:
    """Normalize text for comparison"""
    return text.lower().strip()

def calculate_skill_match(candidate_skills: List[str], required_skills: List[str]) -> float:
    """Calculate skill match percentage"""
    if not required_skills:
        return 100.0
    
    candidate_skills_norm = [normalize_text(s) for s in candidate_skills]
    required_skills_norm = [normalize_text(s) for s in required_skills]
    
    matches = sum(1 for skill in required_skills_norm if skill in candidate_skills_norm)
    return (matches / len(required_skills_norm)) * 100

def calculate_experience_match(candidate_years: int, required_level: str) -> float:
    """Calculate experience level match"""
    level_requirements = {
        'junior': (0, 2),
        'medior': (2, 5),
        'senior': (5, 10),
        'lead': (8, 100)
    }
    
    if required_level not in level_requirements:
        return 50.0
    
    min_years, max_years = level_requirements[required_level]
    
    if min_years <= candidate_years <= max_years:
        return 100.0
    elif candidate_years < min_years:
        diff = min_years - candidate_years
        return max(0, 100 - (diff * 20))
    else:
        return 90.0  # Overqualified is still good

def calculate_location_match(candidate_pref: str, vacancy_location: str, 
                            candidate_remote: str, vacancy_remote: str) -> float:
    """Calculate location and remote preference match"""
    # Remote work preferences
    if candidate_remote == 'remote' and vacancy_remote == 'remote':
        return 100.0
    elif candidate_remote == 'remote' and vacancy_remote == 'hybrid':
        return 80.0
    elif candidate_remote == 'hybrid' and vacancy_remote in ['remote', 'hybrid']:
        return 90.0
    
    # Location match
    candidate_loc_norm = normalize_text(candidate_pref)
    vacancy_loc_norm = normalize_text(vacancy_location)
    
    if candidate_loc_norm == vacancy_loc_norm:
        return 100.0
    elif candidate_loc_norm in vacancy_loc_norm or vacancy_loc_norm in candidate_loc_norm:
        return 70.0
    else:
        return 30.0

def calculate_match_score(candidate: Candidate, vacancy: Vacancy) -> Dict[str, Any]:
    """Calculate overall match score between candidate and vacancy"""
    
    # Calculate individual scores
    skill_score = calculate_skill_match(candidate.skills, vacancy.required_skills)
    experience_score = calculate_experience_match(candidate.experience_years, vacancy.experience_level)
    location_score = calculate_location_match(
        candidate.preferred_location, 
        vacancy.location,
        candidate.remote_preference,
        vacancy.remote_option
    )
    
    # Weighted average (skills are most important)
    weights = {
        'skills': 0.5,
        'experience': 0.3,
        'location': 0.2
    }
    
    overall_score = (
        skill_score * weights['skills'] +
        experience_score * weights['experience'] +
        location_score * weights['location']
    )
    
    return {
        'vacancy_id': vacancy.id,
        'overall_score': round(overall_score, 2),
        'skill_match': round(skill_score, 2),
        'experience_match': round(experience_score, 2),
        'location_match': round(location_score, 2),
        'breakdown': {
            'skills': f"{skill_score:.0f}%",
            'experience': f"{experience_score:.0f}%",
            'location': f"{location_score:.0f}%"
        }
    }

def match_candidate_to_vacancies(candidate_data: Dict, vacancies_data: List[Dict]) -> List[Dict]:
    """Match a candidate to multiple vacancies"""
    
    candidate = Candidate(
        id=candidate_data['id'],
        skills=candidate_data.get('skills', []),
        experience_years=candidate_data.get('experience_years', 0),
        education_level=candidate_data.get('education_level', ''),
        preferred_location=candidate_data.get('preferred_location', ''),
        remote_preference=candidate_data.get('remote_preference', 'flexible'),
        availability=candidate_data.get('availability', 'immediate')
    )
    
    matches = []
    for vacancy_data in vacancies_data:
        vacancy = Vacancy(
            id=vacancy_data['id'],
            title=vacancy_data['title'],
            required_skills=vacancy_data.get('required_skills', []),
            experience_level=vacancy_data.get('experience_level', 'medior'),
            location=vacancy_data.get('location', ''),
            remote_option=vacancy_data.get('remote_option', 'onsite'),
            employment_type=vacancy_data.get('employment_type', 'fulltime')
        )
        
        match_result = calculate_match_score(candidate, vacancy)
        match_result['vacancy_title'] = vacancy.title
        matches.append(match_result)
    
    # Sort by overall score descending
    matches.sort(key=lambda x: x['overall_score'], reverse=True)
    
    return matches

def main():
    """Main function to run matching algorithm"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No input data provided'}))
        sys.exit(1)
    
    try:
        input_data = json.loads(sys.argv[1])
        candidate_data = input_data.get('candidate')
        vacancies_data = input_data.get('vacancies', [])
        
        if not candidate_data:
            print(json.dumps({'error': 'No candidate data provided'}))
            sys.exit(1)
        
        matches = match_candidate_to_vacancies(candidate_data, vacancies_data)
        
        print(json.dumps({
            'success': True,
            'matches': matches,
            'total_vacancies': len(vacancies_data),
            'top_matches': [m for m in matches if m['overall_score'] >= 70]
        }))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
